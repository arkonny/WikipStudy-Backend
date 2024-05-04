const uploadURL = process.env.UPLOAD_URL;

const uploadImage = async (imageUrl: string, token: string) => {
  const image = await fetch(imageUrl).then((res) => res.blob());
  const formData = new FormData();
  formData.append('file', image);
  const response = await fetch(`${uploadURL}/upload`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const imageUploadData = await response.json();
  if (!imageUploadData.data) {
    throw new Error('Image upload failed');
  }
  return imageUploadData.data.filename.toString();
};

export default uploadImage;
