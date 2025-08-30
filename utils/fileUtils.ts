export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result format: "data:image/jpeg;base64,..."
            const parts = result.split(',');
            if (parts.length !== 2) {
                return reject(new Error("Invalid data URL format"));
            }

            const metaPart = parts[0];
            const base64 = parts[1];
            
            const mimeTypeMatch = metaPart.match(/:(.*?);/);
            if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
                return reject(new Error("Could not determine mime type from data URL"));
            }
            const mimeType = mimeTypeMatch[1];
            
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};

export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error("Invalid data URL");
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) {
        throw new Error("Could not determine mime type from data URL");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
};