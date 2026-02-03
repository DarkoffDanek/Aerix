// 🔴 ВСТАВЬ СВОИ ДАННЫЕ SUPABASE
const SUPABASE_URL = "https://wcnjgiaksmuzlclikrwi.supabase.co";
const SUPABASE_KEY = "sb_secret_nnOBpeoR7L49r6lF3qdzvg_AmpG1cxp";

const supabase = supabaseJs.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ---------- AUTH ----------

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({ email, password });
  alert(error ? error.message : "Аккаунт создан, можно входить");
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// ---------- FILES ----------

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return;

  const user = (await supabase.auth.getUser()).data.user;
  const path = `${user.id}/${file.name}`;

  const { error } = await supabase
    .storage
    .from("files")
    .upload(path, file, { upsert: true });

  if (error) alert(error.message);
  else loadFiles();
}

async function loadFiles() {
  const list = document.getElementById("fileList");
  if (!list) return;

  list.innerHTML = "";

  const user = (await supabase.auth.getUser()).data.user;

  const { data, error } = await supabase
    .storage
    .from("files")
    .list(user.id);

  if (error) return alert(error.message);

  for (const file of data) {
    const { data: link } = await supabase
      .storage
      .from("files")
      .createSignedUrl(`${user.id}/${file.name}`, 3600);

    const li = document.createElement("li");
    li.innerHTML = `<a href="${link.signedUrl}" target="_blank">${file.name}</a>`;
    list.appendChild(li);
  }
}

// ---------- PROTECT PAGE ----------

(async () => {
  const { data } = await supabase.auth.getSession();
  const isDashboard = window.location.pathname.includes("dashboard");

  if (isDashboard && !data.session) {
    window.location.href = "index.html";
  }

  if (isDashboard && data.session) {
    loadFiles();
  }
})();
