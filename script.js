function checkLogin() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const error = document.getElementById("error");

  // এখানে তুমি তোমার নিজের ইউজারনেম আর পাসওয়ার্ড দেবে
  const correctUser = "anik";
  const correctPass = "12345";

  if (user === correctUser && pass === correctPass) {
    // লগইন সফল হলে
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";

    // চাইলে লগইন রিমেম্বারও করা যাবে (ব্রাউজারে)
    localStorage.setItem("loggedIn", "true");
  } else {
    error.innerText = "ইউজারনেম বা পাসওয়ার্ড ভুল!";
  }
}

// পেজ রিফ্রেশের পরেও লগইন অবস্থায় রাখবে
window.onload = function() {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
  }
};function generateCV() {
  document.getElementById("outName").innerText = document.getElementById("name").value;
  document.getElementById("outFname").innerText = document.getElementById("fname").value;
  document.getElementById("outMname").innerText = document.getElementById("mname").value;
  document.getElementById("outPaddress").innerText = document.getElementById("paddress").value;
  document.getElementById("outCaddress").innerText = document.getElementById("caddress").value;
  document.getElementById("outMobile").innerText = document.getElementById("mobile").value;
  document.getElementById("outDob").innerText = document.getElementById("dob").value;
  document.getElementById("outSex").innerText = document.getElementById("sex").value;
  document.getElementById("outHeight").innerText = document.getElementById("height").value;
  document.getElementById("outReligion").innerText = document.getElementById("religion").value;
  document.getElementById("outNationality").innerText = document.getElementById("nationality").value;

  document.getElementById("outHscGroup").innerText = document.getElementById("hscGroup").value;
  document.getElementById("outHscBoard").innerText = document.getElementById("hscBoard").value;
  document.getElementById("outHscGpa").innerText = document.getElementById("hscGpa").value;
  document.getElementById("outHscYear").innerText = document.getElementById("hscYear").value;

  document.getElementById("outSscGroup").innerText = document.getElementById("sscGroup").value;
  document.getElementById("outSscBoard").innerText = document.getElementById("sscBoard").value;
  document.getElementById("outSscGpa").innerText = document.getElementById("sscGpa").value;
  document.getElementById("outSscYear").innerText = document.getElementById("sscYear").value;

  document.getElementById("cvForm").style.display = "none";
  document.getElementById("cvOutput").style.display = "block";
}

function printCV() {
  window.print();
}

