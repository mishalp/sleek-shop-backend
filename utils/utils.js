import jwt from 'jsonwebtoken'

export const getImageData = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        if (reader.readyState === 2) {
            resolve(reader.result)
        }
    }

    reader.onerror = () => {
        reject()
    }
    reader.readAsDataURL(file)
})

export const createActivationToken = (data) => {
    return jwt.sign(data, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};