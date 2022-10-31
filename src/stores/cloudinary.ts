import { Cloudinary } from "@cloudinary/url-gen";

export function useCloudinary() {
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'sicccookbook'
    }
  });
  return cld;
}