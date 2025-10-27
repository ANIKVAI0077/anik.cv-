function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "anik" && pass === "1234") { 
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("cvContainer").style.display = "block";
  } else {
    alert("⚠ ইউজারনেম বা পাসওয়ার্ড ভুল!");
  }
}

function logout() {
  document.getElementById("cvContainer").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("cvForm").style.display = "block";
  document.getElementById("cvOutput").style.display = "none";
}

function generateCV() {
  document.getElementById("cvForm").style.display = "none";
  document.getElementById("cvOutput").style.display = "block";

  // Basic Info
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
  document.getElementById("outMarital").innerText = document.getElementById("maritalStatus").value;

  // Profile Pic
  const file = document.getElementById("profilePic").files[0];
  if(file){
    document.getElementById("outProfilePic").src = URL.createObjectURL(file);
  }

  // Education
  const eduSection = document.getElementById("educationSection");
  const eduDiv = document.getElementById("eduSection");
  eduSection.innerHTML = "";

  if(document.getElementById("hasEducation").checked){
    eduDiv.style.display = "block";
    eduSection.innerHTML += `
      <tr>
        <td>HSC</td>
        <td>${document.getElementById("hscGroup").value}</td>
        <td>${document.getElementById("hscBoard").value}</td>
        <td>${document.getElementById("hscGpa").value}</td>
        <td>${document.getElementById("hscYear").value}</td>
      </tr>
      <tr>
        <td>SSC</td>
        <td>${document.getElementById("sscGroup").value}</td>
        <td>${document.getElementById("sscBoard").value}</td>
        <td>${document.getElementById("sscGpa").value}</td>
        <td>${document.getElementById("sscYear").value}</td>
      </tr>`;
  } else {
    eduDiv.style.display = "none";
  }

  // Work Experience
  const workSection = document.getElementById("workSection");
  const workDiv = document.getElementById("workExperience");
  workSection.innerHTML = "";

  if(document.getElementById("hasWork").checked){
    workDiv.style.display = "block";
    workSection.innerHTML += `
      <tr>
        <td>${document.getElementById("jobTitle").value}</td>
        <td>${document.getElementById("companyName").value}</td>
        <td>${document.getElementById("jobDescription").value}</td>
      </tr>`;
  } else {
    workDiv.style.display = "none";
  }
}

function printCV() {
  window.print();
}
