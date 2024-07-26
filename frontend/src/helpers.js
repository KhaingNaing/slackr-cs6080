/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export const apiCallPost = (path, body, authed) => {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005' + path, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': authed !== null ? `Bearer ${authed}` : undefined
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        });
    })
};

export const apiCallPut = (path, body, authed) => {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005' + path, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'Authorization': authed !== null ? `Bearer ${authed}` : undefined
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        });
    })
};

export const apiCallGet = (path, data, authed) => {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005' + path, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': authed !== null ? `Bearer ${authed}` : undefined
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        });
    });
};
 
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    let day = date.getDate();
    let month = date.getMonth() + 1; // increment 1 since it is 0 base
    let year = date.getFullYear();

    // format to DD/MM/YYYY
    day = day.toString().padStart(2, '0');
    month = month.toString().padStart(2, '0');

    return `${day}/${month}/${year}`
}