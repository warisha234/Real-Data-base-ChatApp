import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
// import { getDatabase } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  remove
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";


// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB3RQ-6yfsZ7bYGPopEcNmecQXcfb0oSpw",
  authDomain: "authentication-app-6f9bb.firebaseapp.com",
  databaseURL: "https://authentication-app-6f9bb-default-rtdb.firebaseio.com",
  projectId: "authentication-app-6f9bb",
 storageBucket: "authentication-app-6f9bb.appspot.com",

  messagingSenderId: "506135142533",
  appId: "1:506135142533:web:6f31c718c19b0f318b49ec",
  measurementId: "G-QN2XF1H7DS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// authentication part
// sign in
document.getElementById("signup-btn")?.addEventListener("click", () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  if (!email || !password) return alert("Please fill in all fields!");

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Sign Up Successful!");
      window.location.href = "user.html";
    })
    .catch((err) => alert("Error: " + err.message));
});



//  Login
document.getElementById("login-btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login Successful! ✅");
      window.location.href = "user.html";
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err.message);
    });
});

// Google Login
document.getElementById("google-btn")?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Google Login Successful! 🌐");
      window.location.href = "user.html";
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err.message);
    });
});

//  Logout
document.getElementById("Logout-btn")?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logout Successful! 👋");
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err.message);
    });
});


// user name user html

document.getElementById("user-btn")?.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Please enter a username!");
  localStorage.setItem("username", username);
  window.location.href = "chat.html";
});
// clear chats all
document.getElementById("clearChats")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats? ❌")) {
    remove(msgRef)
      .then(() => {
       
        const msgContainer = document.getElementById("messages");
        msgContainer.innerHTML = "";
        alert("All chats cleared! ✅");
      })
      .catch((err) => {
        console.error(err);
        alert("Error clearing chats: " + err.message);
      });
  }
});


// add delete edit functions
const username = localStorage.getItem("username");
const msgContainer = document.getElementById("messages");
const msgRef = ref(db, "messages");


// Send Message
document.getElementById("sendMessage")?.addEventListener("click", () => {
  const msgInput = document.getElementById("message");
  const text = msgInput.value.trim();
  if (!username) return alert("Username not found! Please set it first.");
  if (!text) return;

  const newMsgRef = push(msgRef);
  set(newMsgRef, {
    name: username,
    text: text,
    time: Date.now(),
  });

  msgInput.value = "";
});

//  new messages
onChildAdded(msgRef, (snapshot) => {
  showMessage(snapshot.key, snapshot.val());
});

//  edited messages
onChildChanged(msgRef, (snapshot) => {
  updateMessage(snapshot.key, snapshot.val());
});

//  delete messages
onChildRemoved(msgRef, (snapshot) => {
  document.querySelector(`[data-id="${snapshot.key}"]`)?.remove();
});

// msg display in chat app
function showMessage(id, data) {
  const isMyMsg = data.name === username; 
  const safeText = data.text.replace(/[<>]/g, ""); 

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isMyMsg ? "own" : "other");
  messageDiv.dataset.id = id;

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = safeText;

  //edit & delete buttons
  if (isMyMsg) {
  const actions = document.createElement("div");
  actions.classList.add("actions");

  // Edit Button 
  const editBtn = document.createElement("button");
  const editIcon = document.createElement("img");
  editIcon.src = "edit icon.png"; 
  editIcon.alt = "Edit";
  editIcon.style.width = "20px";
  editIcon.style.height = "20px";
  editBtn.appendChild(editIcon);
  editBtn.onclick = () => editMessage(id, safeText);

  //  Delete Button 
  const deleteBtn = document.createElement("button");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "delete icon.png"; 
  deleteIcon.alt = "Delete";
  deleteIcon.style.width = "20px";
  deleteIcon.style.height = "20px";
  deleteBtn.appendChild(deleteIcon);
  deleteBtn.onclick = () => deleteMessage(id);

  actions.append(editBtn, deleteBtn);
  bubble.appendChild(actions);
}


  //time setting
  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  timestamp.textContent = `${data.name} • ${new Date(data.time).toLocaleTimeString()}`;

  // show message
  messageDiv.append(bubble, timestamp);
  msgContainer.appendChild(messageDiv);

//  adding scroller
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

// Edit Message in chat
window.editMessage = (id, oldText) => {
  const newText = prompt("Edit your message:", oldText);
  if (newText?.trim()) {
    set(ref(db, "messages/" + id), {
      name: username,
      text: newText.trim(),
      time: Date.now(),
    });
  }
};

// Delete Message
window.deleteMessage = (id) => {
  if (confirm("Delete this message?")) remove(ref(db, "messages/" + id));
};

// Edit ke baad message update hone par bhi icons intact rahenge
function updateMessage(id, data) {
  const msgDiv = document.querySelector(`[data-id="${id}"] .bubble`);
  if (msgDiv) {
    const safeText = data.text.replace(/[<>]/g, "");
    msgDiv.innerHTML = `${safeText}`;


    if (data.name === username) {
      const actions = document.createElement("div");
      actions.classList.add("actions");

      //  Edit button with icon
      const editBtn = document.createElement("button");
      const editIcon = document.createElement("img");
      editIcon.src = "edit icon.png"; // path to your edit icon
      editIcon.alt = "Edit";
      editIcon.style.width = "20px";
      editIcon.style.height = "20px";
      editBtn.appendChild(editIcon);
      editBtn.onclick = () => editMessage(id, safeText);

      // Delete button with icon
      const deleteBtn = document.createElement("button");
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "delete icon.png"; // path to your delete icon
      deleteIcon.alt = "Delete";
      deleteIcon.style.width = "20px";
      deleteIcon.style.height = "20px";
      deleteBtn.appendChild(deleteIcon);
      deleteBtn.onclick = () => deleteMessage(id);

      actions.append(editBtn, deleteBtn);
      msgDiv.appendChild(actions);
    }
  }
}
// for recording audio
const voiceBtn = document.getElementById("voice-btn");
const messageBox = document.getElementById("messages");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

voiceBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      // Start Recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      audioChunks = [];
      mediaRecorder.start();
      isRecording = true;
      voiceBtn.textContent = "⏹";

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(audioBlob);
        const bubble = document.createElement("div");
        bubble.classList.add("message", "own");

        const innerBubble = document.createElement("div");
        innerBubble.classList.add("bubble");

    
        const audioElement = document.createElement("audio");
        audioElement.src = audioURL;
        audioElement.controls = true;
        audioElement.style.width = "150px";

        //  Delete Button
        const deleteBtn = document.createElement("button");
        const deleteIcon = document.createElement("img");
        deleteIcon.src = "delete icon.png"; 
        deleteIcon.alt = "Delete";
        deleteIcon.style.width = "20px";
        deleteIcon.style.height = "20px";
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.style.background = "transparent";
        deleteBtn.style.border = "none";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.marginLeft = "8px";

        deleteBtn.onclick = () => {
          bubble.remove(); 
        };

        innerBubble.append(audioElement, deleteBtn);
        bubble.appendChild(innerBubble);
        messageBox.appendChild(bubble);

      //  scroll k liye
        messageBox.scrollTop = messageBox.scrollHeight;
      });
    } catch (error) {
      alert("Microphone permission denied or not supported 😞");
      console.error(error);
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    voiceBtn.textContent = "▶";
  }
});

  // emoji select
document.addEventListener("DOMContentLoaded", () => {
  const emojiBtn = document.getElementById("emoji-btn");
  const emojiPicker = document.getElementById("emoji-picker");
  const messageInput = document.getElementById("message");

  if (!emojiBtn || !emojiPicker || !messageInput) {
    console.error("❌ Emoji elements not found. Check HTML IDs.");
    return;
  }
  const emojis = [
  "😀", "😁", "😂", "🤣", "😅", "😊", "😍", "😘", "😎", "😇", "🥰", "🤗",
  "😢", "😭", "😡", "😤", "😱", "😴", "🤔", "😐", "🙄", "😬", "🤨", "🤩",
  "👍", "👎", "👏", "🙌", "🤝", "🙏", "🔥", "✨", "🌟", "💫", "💥", "💯",
  "❤️", "🩷", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
  "📩", "🗝️", "📞", "💬", "🎧", "🎵", "🎶", "🎤", "🎁", "🎂",
  "🍕", "🍔", "🍟", "🍩", "🍫", "☕", "🍹", "🍓", "🍎", "🍊",
  "🐶", "🐱", "🐰", "🐼", "🐻", "🐥", "🦋", "🌸", "🌼", "🌻",
  "☀️", "🌙", "⭐", "🌈", "☁️", "⚡", "❄️", "🌧️", "🌊", "🔥",
  "✈️", "🚗", "🚀", "🏠", "🕹️", "💻", "📱", "🖋️", "📚", "💡"
];

  emojiPicker.innerHTML = "";
  emojis.forEach((emoji) => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.cursor = "pointer";
    span.style.fontSize = "22px";
    span.style.margin = "5px";
    span.addEventListener("click", () => {
      messageInput.value += emoji;
      emojiPicker.style.display = "none";
    });
    emojiPicker.appendChild(span);
  });

  emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    emojiPicker.style.display =
      emojiPicker.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.style.display = "none";
    }
  });
});





document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

  
    const focused = document.activeElement;
    if (focused && focused.tagName === "BUTTON") {
      focused.click();
      return;
    }


    const possibleButtons = [
      "sendMessage",
      "login",
      "signup",
      "user-btn",
      "google-btn",
    ];

    for (const id of possibleButtons) {
      const btn = document.getElementById(id);
      if (btn && btn.offsetParent !== null) {
        btn.click();
        break;
      }
    }
  }
});