/* ==========================================
   Professional Bangladesh CV Generator
   script.js — Part-1
========================================== */

"use strict";

/* ===========================
   Elements
=========================== */

const form = document.getElementById("cvForm");

const photoInput = document.getElementById("photo");

const previewPhoto = document.getElementById("previewPhoto");

const photoPlaceholder = document.getElementById("photoPlaceholder");

/* ===========================
   Input → Preview Mapping
=========================== */

const previewMap = {

    fullName: "viewFullName",

    fatherName: "viewFatherName",

    motherName: "viewMotherName",

    birthDate: "viewBirthDate",

    gender: "viewGender",

    religion: "viewReligion",

    nationality: "viewNationality",

    height: "viewHeight",

    bloodGroup: "viewBloodGroup",

    maritalStatus: "viewMaritalStatus",

    mobile: "viewMobile",

    email: "viewEmail",

    nid: "viewNid",

    birthCertificate: "viewBirthCertificate",

    presentAddress: "viewPresentAddress",

    permanentAddress: "viewPermanentAddress",

    hscGroup: "viewHscGroup",

    hscBoard: "viewHscBoard",

    hscResult: "viewHscResult",

    hscYear: "viewHscYear",

    sscGroup: "viewSscGroup",

    sscBoard: "viewSscBoard",

    sscResult: "viewSscResult",

    sscYear: "viewSscYear"

};

/* ===========================
   Live Preview
=========================== */

function updatePreview(inputId){

    const input = document.getElementById(inputId);

    const output = document.getElementById(previewMap[inputId]);

    if(!input || !output){

        return;

    }

    output.textContent = input.value;

}

/* ===========================
   Attach Live Event
=========================== */

Object.keys(previewMap).forEach(function(id){

    const input = document.getElementById(id);

    if(!input){

        return;

    }

    input.addEventListener("input",function(){

        updatePreview(id);

        saveData();

    });

});

/* ===========================
   Today Date
=========================== */

function updateDate(){

    const today = new Date();

    const day = String(today.getDate()).padStart(2,"0");

    const month = String(today.getMonth()+1).padStart(2,"0");

    const year = today.getFullYear();

    const dateBox = document.getElementById("viewDate");

    if(dateBox){

        dateBox.textContent = day + "/" + month + "/" + year;

    }

}

updateDate();

/* ===========================
   Signature Name
=========================== */

const fullNameInput = document.getElementById("fullName");

if(fullNameInput){

    fullNameInput.addEventListener("input",function(){

        const sign = document.getElementById("viewSignatureName");

        if(sign){

            sign.textContent = this.value || "আবেদনকারীর স্বাক্ষর";

        }

    });

}/* ==========================================
   Professional Bangladesh CV Generator
   script.js — Part-2
========================================== */

/* ===========================
   Local Storage
=========================== */

const STORAGE_KEY = "bd_cv_generator_v2";

/* ===========================
   Save Form Data
=========================== */

function saveData(){

    const data = {};

    Object.keys(previewMap).forEach(function(id){

        const input = document.getElementById(id);

        if(input){

            data[id] = input.value;

        }

    });

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );

}

/* ===========================
   Load Form Data
=========================== */

function loadData(){

    const saved = localStorage.getItem(STORAGE_KEY);

    if(!saved){

        return;

    }

    const data = JSON.parse(saved);

    Object.keys(data).forEach(function(id){

        const input = document.getElementById(id);

        if(input){

            input.value = data[id];

            updatePreview(id);

        }

    });

}

/* ===========================
   Photo Upload
=========================== */

if(photoInput){

    photoInput.addEventListener("change",function(){

        const file = this.files[0];

        if(!file){

            return;

        }

        const reader = new FileReader();

        reader.onload = function(e){

            previewPhoto.src = e.target.result;

            previewPhoto.style.display = "block";

            photoPlaceholder.style.display = "none";

            localStorage.setItem(

                "cv_photo",

                e.target.result

            );

        };

        reader.readAsDataURL(file);

    });

}

/* ===========================
   Load Saved Photo
=========================== */

function loadPhoto(){

    const photo = localStorage.getItem("cv_photo");

    if(!photo){

        return;

    }

    previewPhoto.src = photo;

    previewPhoto.style.display = "block";

    photoPlaceholder.style.display = "none";

}

/* ===========================
   Reset Form
=========================== */

if(form){

    form.addEventListener("reset",function(){

        setTimeout(function(){

            localStorage.removeItem(STORAGE_KEY);

            localStorage.removeItem("cv_photo");

            location.reload();

        },100);

    });

}

/* ===========================
   Initial Load
=========================== */

window.addEventListener("load",function(){

    loadData();

    loadPhoto();

});/* ==========================================
   Professional Bangladesh CV Generator
   script.js — Part-3
========================================== */

/* ===========================
   PDF Download
=========================== */

const downloadBtn = document.getElementById("downloadPdf");

if(downloadBtn){

    downloadBtn.addEventListener("click",generatePDF);

}

async function generatePDF(){

    const cv = document.getElementById("cvPreview");

    if(!cv){

        return;

    }

    downloadBtn.disabled = true;

    downloadBtn.textContent = "PDF তৈরি হচ্ছে...";

    try{

        const canvas = await html2canvas(cv,{

            scale:3,

            useCORS:true,

            allowTaint:true,

            backgroundColor:"#ffffff",

            logging:false,

            imageTimeout:0,

            removeContainer:true

        });

        const imgData = canvas.toDataURL("image/png",1.0);

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4",

            compress:true

        });

        const pdfWidth = 210;

        const pdfHeight = 297;

        pdf.addImage(

            imgData,

            "PNG",

            0,

            0,

            pdfWidth,

            pdfHeight,

            undefined,

            "FAST"

        );

        pdf.save("বাংলাদেশ-জীবনবৃত্তান্ত.pdf");

    }catch(error){

        console.error(error);

        alert("PDF তৈরি করতে সমস্যা হয়েছে।");

    }

    downloadBtn.disabled = false;

    downloadBtn.textContent = "PDF ডাউনলোড";

}

/* ===========================
   Print
=========================== */

const printBtn = document.getElementById("printCv");

if(printBtn){

    printBtn.addEventListener("click",function(){

        window.print();

    });

}

/* ===========================
   Refresh Preview
=========================== */

function refreshPreview(){

    Object.keys(previewMap).forEach(function(id){

        updatePreview(id);

    });

}

refreshPreview();

/* ===========================
   Auto Update Date
=========================== */

setInterval(function(){

    updateDate();

},60000);

/* ===========================
   Image Error Fix
=========================== */

if(previewPhoto){

    previewPhoto.onerror = function(){

        this.style.display = "none";

        if(photoPlaceholder){

            photoPlaceholder.style.display = "flex";

        }

    };

}
/* ==========================================
   Professional Bangladesh CV Generator
   script.js — Part-4
========================================== */

/* ===========================
   Required Field Validation
=========================== */

function validateForm(){

    const requiredFields = [

        "fullName",

        "fatherName",

        "motherName",

        "mobile"

    ];

    for(const id of requiredFields){

        const input = document.getElementById(id);

        if(!input){

            continue;

        }

        if(input.value.trim() === ""){

            alert("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");

            input.focus();

            return false;

        }

    }

    return true;

}

/* ===========================
   Mobile Number Validation
=========================== */

const mobileInput = document.getElementById("mobile");

if(mobileInput){

    mobileInput.addEventListener("input",function(){

        this.value = this.value.replace(/[^0-9]/g,"");

        if(this.value.length > 11){

            this.value = this.value.substring(0,11);

        }

    });

}

/* ===========================
   PDF Button Validation
=========================== */

if(downloadBtn){

    downloadBtn.addEventListener("click",function(e){

        if(!validateForm()){

            e.preventDefault();

            return;

        }

    });

}

/* ===========================
   Print Validation
=========================== */

if(printBtn){

    printBtn.addEventListener("click",function(e){

        if(!validateForm()){

            e.preventDefault();

            return;

        }

    });

}

/* ===========================
   Auto Save Before Exit
=========================== */

window.addEventListener("beforeunload",function(){

    saveData();

});

/* ===========================
   Prevent Form Submit
=========================== */

if(form){

    form.addEventListener("submit",function(e){

        e.preventDefault();

    });

}

/* ===========================
   Initialize Project
=========================== */

window.addEventListener("DOMContentLoaded",function(){

    loadData();

    loadPhoto();

    refreshPreview();

    updateDate();

});

/* ===========================
   Focus First Input
=========================== */

window.addEventListener("load",function(){

    const firstInput = document.getElementById("fullName");

    if(firstInput){

        firstInput.focus();

    }

});

/* ===========================
   Clear Preview When Empty
=========================== */

Object.keys(previewMap).forEach(function(key){

    const input = document.getElementById(key);

    const output = document.getElementById(previewMap[key]);

    if(input && output && input.value.trim()===""){

        output.textContent = "";

    }

});

/* ===========================
   Console Message
=========================== */

console.log(
    "Professional Bangladesh CV Generator Loaded Successfully."
);

