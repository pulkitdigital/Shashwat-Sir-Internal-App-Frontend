import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../utils/firebaseConfig";

const storage = getStorage(app);

export const uploadImageToFirebase = async (file) => {
  try {
    const storageRef = ref(storage, `profiles/${Date.now()}_${file.name}`);
    
    await uploadBytes(storageRef, file);
    
    const url = await getDownloadURL(storageRef);

    return url;
  } catch (error) {
    console.error(error);
  }
};