const imageUpload = document.querySelector('#imageUpload');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

async function start() {
    const container = createContainer();

    document.body.append(container);

    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    document.body.append('loaded');

    imageUpload.addEventListener('change', () => handleChangeImage(faceMatcher));
}

async function handleChangeImage(faceMatcher) {
    const image = await faceapi.bufferToImage(imageUpload.files[0]);
    const canvas = faceapi.createCanvasFromMedia(image);

    document.body.append(image, canvas);

    const displaySize = {width: image.width, height: image.height};
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors()
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    results.forEach((result, index) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()});
        drawBox.draw(canvas);
    })
}

function createContainer() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    return container;
}

function loadLabeledImages() {
    const labels = ['Black Window', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
    return Promise.all(labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(`public/labeled_images/${label}/${i}.jpg`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptors();
            console.log({detections});
            descriptions.push(detections.descriptor);
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions);
    }))
}