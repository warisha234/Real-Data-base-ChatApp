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

    const editBtn = document.createElement("button");
    editBtn.textContent = "🖋️";
    editBtn.onclick = () => editMessage(id, safeText);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
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

// edit k bd msg
function updateMessage(id, data) {
  const msgDiv = document.querySelector(`[data-id="${id}"] .bubble`);
  if (msgDiv) {
    const safeText = data.text.replace(/[<>]/g, "");
    msgDiv.innerHTML = `
      ${safeText}
      ${
        data.name === username
          ? `
        <div class="actions">
          <button onclick="editMessage('${id}', '${safeText.replace(/'/g, "\\'")}')">✏️</button>
          <button onclick="deleteMessage('${id}')">🗑️</button>
        </div>` : ""
      }
    `;
  }
}


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