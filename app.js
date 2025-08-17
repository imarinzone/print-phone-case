const imageLoader = document.getElementById('imageLoader');
const phoneModelSelector = document.getElementById('phoneModelSelector');
const finalizeButton = document.getElementById('finalizeButton');
const printButton = document.getElementById('printButton');
const canvas = document.getElementById('caseCanvas');
const ctx = canvas.getContext('2d');

let userImage = null;
let isDragging = false;
let imageX = 50;
let imageY = 50;
let imageScale = 1;
let imageAngle = 0;

const phoneModels = {
    'iphone-13-pro_6.1': { width: 300, height: 500 },
    'iphone-13-pro-max_6.7': { width: 320, height: 550 },
    'samsung-galaxy-s22_6.1': { width: 290, height: 510 },
    'samsung-galaxy-s22-ultra_6.8': { width: 310, height: 560 },
};

function drawPhoneCase() {
    const selectedModel = phoneModelSelector.value;
    const { width, height } = phoneModels[selectedModel];

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function redrawCanvas() {
    drawPhoneCase();

    if (userImage) {
        ctx.save();
        ctx.translate(imageX, imageY);
        ctx.rotate(imageAngle);
        ctx.scale(imageScale, imageScale);
        ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2);
        ctx.restore();
    }
}

imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        userImage = new Image();
        userImage.onload = () => {
            redrawCanvas();
        };
        userImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

phoneModelSelector.addEventListener('change', () => {
    redrawCanvas();
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        imageX = e.clientX - rect.left;
        imageY = e.clientY - rect.top;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

finalizeButton.addEventListener('click', () => {
    // "Flatten" the design by simply redrawing it
    redrawCanvas();
});

printButton.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const windowContent = `<!DOCTYPE html><html><head><title>Print</title></head><body><img src="${dataUrl}"></body></html>`;
    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
});

drawPhoneCase();
