/* ===============================
   NoorDesign - Advanced Canvas Editor JS
================================ */

// Initialize Canvas
const canvas = new fabric.Canvas('canvas', {
    preserveObjectStacking: true
});

// Default Background
canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

/* ===== ADD TEXT ===== */
function addText() {
    const text = new fabric.Textbox('আপনার লেখা লিখুন', {
        left: 100,
        top: 100,
        fontSize: 40,
        fill: '#000000',
        fontFamily: 'Arial',
        editable: true
    });
    canvas.add(text);
    canvas.setActiveObject(text);
}

/* ===== CHANGE TEXT COLOR ===== */
function changeTextColor(color) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fill', color);
        canvas.renderAll();
    }
}

/* ===== CHANGE FONT SIZE ===== */
function changeFontSize(size) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontSize', parseInt(size));
        canvas.renderAll();
    }
}

/* ===== CHANGE FONT FAMILY ===== */
function changeFont(font) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontFamily', font);
        canvas.renderAll();
    }
}

/* ===== UPLOAD IMAGE ===== */
function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        fabric.Image.fromURL(e.target.result, function(img) {
            img.set({
                left: 150,
                top: 150
            });
            img.scaleToWidth(300);
            canvas.add(img);
            canvas.setActiveObject(img);
        });
    };
    reader.readAsDataURL(file);
}

/* ===== BACKGROUND COLOR ===== */
function changeBackground(color) {
    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
}

/* ===== SET BACKGROUND IMAGE ===== */
function setBackgroundImage(fileName) {
    if (!fileName) {
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        return;
    }
    fabric.Image.fromURL(`assets/backgrounds/${fileName}`, function(img) {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
        });
    });
}

/* ===== CANVAS SIZE ===== */
function changeCanvasSize(value) {
    const size = value.split('x');
    const width = parseInt(size[0]);
    const height = parseInt(size[1]);
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
}

/* ===== DOWNLOAD IMAGE ===== */
function downloadImage() {
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'noordesign-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ===== DELETE OBJECT ===== */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
        }
    }
});
