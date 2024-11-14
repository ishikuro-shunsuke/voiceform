const recognition = new webkitSpeechRecognition();
recognition.lang = "ja-JP";
recognition.continuous = true;
recognition.interimResults = true;

const FIELDS = {
    EQUIPMENT_ID: {
        id: 'equipmentId',
        keyword: '設備IDを入力',
    },
    TEMPERATURE: {
        id: 'temperature',
        keyword: '温度を入力',
    },
    DESCRIPTION: {
        id: 'description',
        keyword: '詳細を入力',
    },
};

let currentField = null;
let silenceTimer = null;
const SILENCE_TIMEOUT = 3000;

window.onload = () => {
    recognition.start();
};

function updateCurrentField(fieldId) {
    const currentElement = document.getElementById(fieldId);
    if (currentElement) {
        currentElement.focus();
    }
}

function resetCurrentField() {
    currentField = null;
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

recognition.onresult = (event) => {
    // 既存のタイマーをクリア
    if (silenceTimer) {
        clearTimeout(silenceTimer);
    }

    const lastIndex = event.results.length - 1;
    const result = event.results[lastIndex][0].transcript;

    console.log(result);
    // FIELDS の keyword を含む場合は、currentField を更新
    const field = Object.values(FIELDS).find((field) => result.includes(field.keyword));
    if (field) {
        currentField = field.id;
        updateCurrentField(field.id);
    } else if (result === '送信') {
        // フォーム内容のサマリを alert する
        const formData = new FormData(document.getElementById('inspectionForm'));
        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
        alert(JSON.stringify(formDataObject, null, 2));

        // 全ての入力をクリアする
        document.getElementById('inspectionForm').submit();
    } else {
        const input = document.getElementById(currentField);
        if (input) {
            input.value = result;
        }
    }

    // 新しいタイマーをセット
    silenceTimer = setTimeout(resetCurrentField, SILENCE_TIMEOUT);
};

// 音声認識が終了したときもタイマーをクリア
recognition.onend = () => {
    if (silenceTimer) {
        clearTimeout(silenceTimer);
    }
};