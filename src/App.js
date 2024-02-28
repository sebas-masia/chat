import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, orderBy, limitToLast, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

const app = initializeApp({
  apiKey: "AIzaSyBUHedfIHolSZkamGOzollkwc3_66zTffk",
  authDomain: "react-chat-e79f9.firebaseapp.com",
  projectId: "react-chat-e79f9",
  storageBucket: "react-chat-e79f9.appspot.com",
  messagingSenderId: "751720669130",
  appId: "1:751720669130:web:365f1a38646b71b7247933",
  measurementId: "G-1Z7CRXBCJR"  
})

const auth = getAuth(app)
const firestore = getFirestore(app)

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try{
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
    
  }

  return (
    <button onClick={signInWithGoogle}>Sing in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => signOut(auth)}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = collection(firestore, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limitToLast(25));

  const [messages] = useCollectionData(messagesQuery, { idField: 'id' })
  const [formValue, setFormValue] = useState('')
  const dummy = useRef()

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
  }
  
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key= {msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='say something nice'/>
        <button type='submit' disabled={!formValue}>🕊️</button>
      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  )
}

export default App;
