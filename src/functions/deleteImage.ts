const uploadURL = process.env.UPLOAD_URL;

const deleteImage = async (filename: string, token: string) => {
  const response = await fetch(`${uploadURL}/upload/${filename}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Image deletion failed');
  }
  return response.json();
};

export default deleteImage;
