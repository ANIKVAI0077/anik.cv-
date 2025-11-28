let customers = JSON.parse(localStorage.getItem("fahimStore")) || [];
let current = null;

function save() { localStorage.setItem("fahimStore", JSON.stringify(customers)); }

function getBase64(file, callback) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => callback(reader.result);
  reader.onerror = error => console.log(error);
}

function addCustomer() {
  let name = document.getElementById("custName").value;
  let phone = document.getElementById("custPhone").value;
  let photoFile = document.getElementById("custPhoto").files[0];

  if (!name || !phone) { alert("নাম ও নম্বর লিখুন"); return; }

  if (photoFile) {
    getBase64(photoFile, (base64Img) => {
      customers.push({ name, phone, photo: base64Img, baki: [] });
      save();
      clearAddCustomerForm();
      loadCustomers();
    });
  } else {
    customers.push({ name, phone, photo: "", baki: [] });
    save();
    clearAddCustomerForm();
    loadCustomers();
  }
}

function clearAddCustomerForm() {
  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custPhoto").value = "";
}

function loadCustomers() {
  let list = document.getElementById("customerList");
  list.innerHTML = "";
  customers.forEach((c, i) => {
    let div = document.createElement("div");
    div.className = "customer-box";
    let img = document.createElement("img");
    img.src = c.photo || "https://via.placeholder.com/50x50?text=No+Image";
    div.appendChild(img);
    let textDiv = document.createElement("div");
    textDiv.innerHTML = `<strong>${c.name}</strong><br>${c.phone}`;
    div.appendChild(textDiv);
    div.onclick = () => openCustomer(i);
    list.appendChild(div);
  });
}
loadCustomers();

function openCustomer(i) {
  current = i;
  document.getElementById("home").classList.add("hidden");
  document.getElementById("customerPanel").classList.remove("hidden");
  let c = customers[i];
  document.getElementById("showName").innerText = c.name;
  document.getElementById("showPhone").innerText = "📞 " + c.phone;
  document.getElementById("custImg").src = c.photo || "https://via.placeholder.com/80x100?text=No+Image";
  loadBaki();
}

function goHome() {
  document.getElementById("customerPanel").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}

function addBaki() {
  let item = document.getElementById("item").value;
  let qty = document.getElementById("qty").value;
  let price = document.getElementById("price").value;
  if (!item || !qty || !price) { alert("সব তথ্য পূরণ করুন"); return; }

  let entry = { id: Date.now(), date: new Date().toLocaleString(), item, qty, price };
  customers[current].baki.push(entry);
  save();
  document.getElementById("item").value = "";
  document.getElementById("qty").value = "";
  document.getElementById("price").value = "";
  loadBaki();
}

function loadBaki() {
  let list = document.getElementById("bakiList");
  list.innerHTML = "";
  customers[current].baki.forEach((b) => {
    let div = document.createElement("div");
    div.className = "baki-item";
    div.innerHTML = `
      <b>📅 ${b.date}</b><br>
      🛒 ${b.item} — ${b.qty}<br>
      💰 ${b.price} টাকা<br>
      <button class="edit-baki-btn" onclick="editBaki(${b.id})">এডিট</button>
      <button class="delete-baki-btn" onclick="deleteBaki(${b.id})">ডিলিট</button>
    `;
    list.appendChild(div);
  });
}

function editBaki(id) {
  let c = customers[current];
  let entry = c.baki.find(b => b.id == id);
  let item = prompt("পণ্যের নাম:", entry.item);
  let qty = prompt("পরিমাণ:", entry.qty);
  let price = prompt("টাকা:", entry.price);
  if (!item || !qty || !price) return;
  entry.item = item; entry.qty = qty; entry.price = price;
  save(); loadBaki();
}

function deleteBaki(id) {
  customers[current].baki = customers[current].baki.filter(b => b.id != id);
  save(); loadBaki();
}

function openEditCustomer() {
  let c = customers[current];
  document.getElementById("editCustomerBox").classList.remove("hidden");
  document.getElementById("editName").value = c.name;
  document.getElementById("editPhone").value = c.phone;
}

function closeEditCustomer() { document.getElementById("editCustomerBox").classList.add("hidden"); }

function saveEditedCustomer() {
  let c = customers[current];
  let name = document.getElementById("editName").value;
  let phone = document.getElementById("editPhone").value;
  let photoFile = document.getElementById("editPhoto").files[0];
  c.name = name; c.phone = phone;

  if (photoFile) {
    getBase64(photoFile, (base64Img) => {
      c.photo = base64Img; save(); document.getElementById("editPhoto").value = "";
      closeEditCustomer(); openCustomer(current);
    });
  } else { save(); closeEditCustomer(); openCustomer(current); }
}

function deleteCustomer() {
  if (confirm("এই কাস্টমারের সব হিসাব ডিলিট হবে!")) {
    customers.splice(current, 1); save(); goHome(); loadCustomers();
  }
        }
