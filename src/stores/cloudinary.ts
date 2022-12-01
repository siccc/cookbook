import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = 'sicccookbook';

export function useCloudinary() {
  const cld = new Cloudinary({
    cloud: {
      cloudName
    }
  });
  return cld;
}

export async function uploadImage(file: string) {
  const userId = localStorage.getItem('userId');
  const data = new FormData();
  data.append('file', file);
  data.append('folder', `cookbook/demo/${userId}`);
  data.append('upload_preset', 'cookbook-preset');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: data
  });
  if (!response.ok) {
    throw new Error('An error occurred while uploading the image. Try again later.');
  }
  const result = await response.text();
  const resultObj = JSON.parse(result);
  const imageName = resultObj.url.substring(resultObj.url.lastIndexOf('/') + 1);
  return({
    imageName,
    imagePublicId: resultObj.public_id
  });
}
