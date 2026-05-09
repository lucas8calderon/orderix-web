import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase.js'

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error; 
  }
};

export default signIn;