document.addEventListener("DOMContentLoaded", () => {
    // 【設定】公開予定のURLとGASのURL
    const SITE_URL = "https://mofu-mitsu.github.io/mbti-moyamuya/"; 
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxleowJbTIwc1k-lP2BJ8efLdoxcgRJ-TjaHFlQ3Z1RbkuA_ySa0KlanjZ--ENGAZ4eKg/exec";

    const startScreen = document.getElementById("start-screen");
    const questionScreen = document.getElementById("question-screen");
    const resultScreen = document.getElementById("result-screen");

    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices-container");

    const resultTitle = document.getElementById("result-title");
    const resultDesc = document.getElementById("result-desc");
    const resultAdvice = document.getElementById("result-advice");

    let currentResultTitle = ""; // 結果のタイトル保存用

    // ▼▼▼ 初期化処理（最初からテンプレを作っておく） ▼▼▼
    generateDefenseTemplates();

    function generateDefenseTemplates() {
        const container = document.getElementById("defense-templates");
        container.innerHTML = "";
        defenseTemplates.forEach(t => {
            const div = document.createElement("div");
            div.classList.add("template-item");
            div.innerHTML = `<strong><i class="fa-solid fa-comment-dots"></i> ${t.trigger}</strong><p>${t.reply}</p>`;
            container.appendChild(div);
        });
    }

    // ▼▼▼ アコーディオンの開閉処理 ▼▼▼
    const accBtn = document.querySelector(".accordion-btn");
    accBtn.addEventListener("click", function() {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });

    // ▼▼▼ GAS送信処理 ▼▼▼
    function sendToGAS(type, content) {
        if (!GAS_URL) return;
        fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ type: type, content: content })
        }).catch(err => console.error("送信エラー:", err));
    }

    // ▼▼▼ 画面遷移・診断処理 ▼▼▼
    startBtn.addEventListener("click", () => {
        startScreen.classList.remove("active");
        showQuestion();
        questionScreen.classList.add("active");
    });

// ▼▼▼ 質問表示（リセット処理をちょっと修正！） ▼▼▼
    function showQuestion() {
        questionText.textContent = quizData.question;
        choicesContainer.innerHTML = "";

        quizData.choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.classList.add("choice-btn");
            btn.innerHTML = choice.text;
            btn.addEventListener("click", () => {
                sendToGAS("choice", choice.text);
                showResult(choice.resultId);
            });
            choicesContainer.appendChild(btn);
        });

        // 自由入力欄のリセット（次に開いた時のために元に戻す）
        document.querySelector(".free-text-title").style.display = "block";
        document.getElementById("free-text-input").value = "";
        document.getElementById("free-text-input").style.display = "block";
        document.getElementById("free-text-btn").style.display = "inline-block";
        document.getElementById("free-text-msg").style.display = "none";
    }

    // ▼▼▼ 自由入力送信 ＆ 飛んでいく演出！ ▼▼▼
    document.getElementById("free-text-btn").addEventListener("click", () => {
        const input = document.getElementById("free-text-input").value;
        if(input.trim() === "") return; // 空っぽなら何もしない

        sendToGAS("free_text", input); // 裏でこっそりみつきのGASへ送信！

        // 入力欄やタイトルを一旦隠す
        document.getElementById("free-text-input").style.display = "none";
        document.getElementById("free-text-btn").style.display = "none";
        document.querySelector(".free-text-title").style.display = "none";

        // ハトを召喚して飛ばす🕊️✨
        const dove = document.createElement("div");
        dove.classList.add("flying-dove");
        dove.innerHTML = '<i class="fa-solid fa-dove"></i>';
        
        const freeTextSection = document.querySelector(".free-text-section");
        freeTextSection.appendChild(dove);

        // 1.5秒後（ハトが飛んで消えた後）に浄化メッセージを表示
        setTimeout(() => {
            dove.remove(); // 飛んでいったハトを削除
            const msg = document.getElementById("free-text-msg");
            msg.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> 浄化完了！トップに戻ります...';
            msg.style.display = "block";

            // さらに2秒後に、自動でトップ画面へ戻る！
            setTimeout(() => {
                questionScreen.classList.remove("active");
                startScreen.classList.add("active");
            }, 2000);

        }, 1500);
    });

    // 結果表示
    function showResult(resultId) {
        const result = resultsData[resultId];
        currentResultTitle = result.title;

        resultTitle.innerHTML = result.title;
        resultDesc.innerHTML = result.desc;
        resultAdvice.innerHTML = result.advice;

        questionScreen.classList.remove("active");
        resultScreen.classList.add("active");
    }

    // もう一度やる（トップへ戻る）
    restartBtn.addEventListener("click", () => {
        resultScreen.classList.remove("active");
        startScreen.classList.add("active");
        // もしテンプレが開いてたら閉じておく
        const accPanel = document.querySelector(".accordion-content");
        if(accPanel) accPanel.style.maxHeight = null;
        if(accBtn) accBtn.classList.remove("active");
    });

    // ▼▼▼ シェア機能 ▼▼▼
    const shareTopBtn = document.getElementById("share-top-btn");
    shareTopBtn.addEventListener("click", () => {
        const text = "「MBTIってなんか違和感ある…」\nそのモヤモヤの正体を1問で解剖！価値観を整理する防衛結界ツールです🔬\n";
        shareContent("MBTIのモヤモヤ解剖室", text, SITE_URL);
    });

    const shareResultBtn = document.getElementById("share-result-btn");
    shareResultBtn.addEventListener("click", () => {
        const text = `私のモヤモヤの正体は【${currentResultTitle}】でした！\n\nMBTIのモヤモヤ解剖室で、違和感を言語化してみよう👇\n`;
        shareContent("MBTIのモヤモヤ解剖室 - 診断結果", text, SITE_URL);
    });

    function shareContent(title, text, url) {
        if (navigator.share) {
            navigator.share({ title: title, text: text, url: url }).catch(console.error);
        } else {
            const shareText = `${text}\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert("📝 共有用のテキストをクリップボードにコピーしました！\n好きなアプリに貼り付けてね！");
            }).catch(() => {
                alert("コピーに失敗しちゃいました🥲");
            });
        }
    }
});
