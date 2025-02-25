const compressImage = ({ img, width = 100, quality = 0.7 }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(img);

    reader.onload = (event) => {
      const img_url = event.target.result;

      const image = new Image();
      image.src = img_url;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = width / image.width;
        canvas.width = width;
        canvas.height = image.height * ratio;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, canvas.height);

        const compressedImg = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedImg); // Resolve the Promise with the compressed image data URL
      };

      image.onerror = (err) => {
        reject(err); // Reject the Promise if there's an error loading the image
      };
    };

    reader.onerror = (err) => {
      reject(err); // Reject the Promise if there's an error reading the file
    };
  });
};

export default compressImage;
