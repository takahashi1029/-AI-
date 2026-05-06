const state = {
  step: "welcome",
  history: [],
  answers: {},
  coreIndex: 0,
  branchQueue: [],
  branchIndex: 0,
  lead: {},
  result: null
};

const LEAD_WEBHOOK_URL = "";

const dimensions = {
  kisuiketsu: {
    qiDef: { label: "気虚", axis: "気", text: "疲れやすさ、気力低下、息切れ、汗をかきやすい傾向" },
    qiStag: { label: "気滞・気鬱", axis: "気", text: "張りつめ、ため息、喉や胸腹部のつかえ、情緒の停滞傾向" },
    qiCounter: { label: "気逆", axis: "気", text: "のぼせ、焦燥感、動悸、発作的な頭痛など上向きの乱れ傾向" },
    bloodDef: { label: "血虚", axis: "血", text: "乾燥、爪や髪の弱さ、眠りの浅さ、月経関連の不足傾向" },
    bloodStasis: { label: "瘀血", axis: "血", text: "くま、固定した痛み、月経痛、巡りの滞り傾向" },
    water: { label: "水滞", axis: "水", text: "むくみ、重だるさ、めまい、鼻水、胃腸の水っぽさの傾向" }
  },
  organs: {
    liver: { label: "肝", text: "ストレス反応、緊張、筋肉症状、目、月経リズムに出やすい傾向" },
    heart: { label: "心", text: "睡眠、動悸、焦燥感、集中力、熱感に出やすい傾向" },
    spleen: { label: "脾", text: "胃腸、食欲、だるさ、考え込み、筋力に出やすい傾向" },
    lung: { label: "肺", text: "呼吸、鼻、皮膚、発汗、外気への弱さに出やすい傾向" },
    kidney: { label: "腎", text: "冷え、腰、耳、泌尿、加齢に伴う消耗感に出やすい傾向" }
  }
};

const coreQuestions = [
  {
    id: "energy",
    title: "日中の体力・気力はどれに近いですか？",
    choices: [
      { label: "疲れやすさが一番気になる", scores: { qiDef: 3, spleen: 2 } },
      { label: "忙しい時だけ疲れが出る", scores: { qiDef: 1 } },
      { label: "該当しない・体力は比較的安定している", scores: {} },
      { label: "張りつめや焦りが一番気になる", scores: { qiStag: 2, qiCounter: 1, liver: 2, heart: 1 } }
    ]
  },
  {
    id: "temperature",
    title: "冷え・ほてりの出方は？",
    choices: [
      { label: "手足や下半身の冷えが一番気になる", scores: { qiDef: 1, kidney: 2, spleen: 1 } },
      { label: "顔や上半身ののぼせが一番気になる", scores: { qiCounter: 3, liver: 1, heart: 1 } },
      { label: "手足のほてりが一番気になる", scores: { bloodDef: 1, heart: 2, kidney: 1 } },
      { label: "該当しない・冷えやほてりはあまり気にならない", scores: {} }
    ]
  },
  {
    id: "digestion",
    title: "胃腸や食後の状態は？",
    choices: [
      { label: "食欲の落ちやすさが一番気になる", scores: { qiDef: 2, spleen: 3, water: 1 } },
      { label: "食後の眠さや重だるさが一番気になる", scores: { water: 3, spleen: 2, lung: 1 } },
      { label: "ストレス時のお腹の張りが一番気になる", scores: { qiStag: 3, liver: 2, spleen: 1 } },
      { label: "該当しない・胃腸はおおむね安定している", scores: {} }
    ]
  },
  {
    id: "mind",
    title: "気分・ストレス反応は？",
    choices: [
      { label: "不安感や気分の落ち込みが一番気になる", scores: { qiStag: 3, liver: 2, lung: 1 } },
      { label: "いらいらしやすさが一番気になる", scores: { qiStag: 2, liver: 3, qiCounter: 1 } },
      { label: "焦りや落ち着かなさが一番気になる", scores: { qiCounter: 2, heart: 3 } },
      { label: "該当しない・気分は比較的安定している", scores: {} }
    ]
  },
  {
    id: "sleep",
    title: "睡眠の悩みに近いものは？",
    choices: [
      { label: "眠りの浅さが一番気になる", scores: { heart: 3, bloodDef: 1, qiStag: 1 } },
      { label: "疲れているのに眠れないことが一番気になる", scores: { bloodDef: 2, heart: 2, kidney: 1 } },
      { label: "朝の重だるさが一番気になる", scores: { water: 2, spleen: 1 } },
      { label: "該当しない・睡眠はおおむね安定している", scores: {} }
    ]
  },
  {
    id: "skinFluid",
    title: "肌・鼻・水分代謝では？",
    choices: [
      { label: "むくみが一番気になる", scores: { water: 3, lung: 2, kidney: 1 } },
      { label: "肌や喉の乾燥が一番気になる", scores: { bloodDef: 3, lung: 1, kidney: 1 } },
      { label: "肌の脂っぽさが一番気になる", scores: { water: 1, spleen: 1, liver: 1 } },
      { label: "該当しない・皮膚や鼻はあまり気にならない", scores: {} }
    ]
  },
  {
    id: "painFlow",
    title: "痛みや巡りのサインは？",
    choices: [
      { label: "同じ場所の痛みが一番気になる", scores: { bloodStasis: 3, liver: 2 } },
      { label: "肩こりや頭痛が一番気になる", scores: { liver: 3, qiStag: 2, bloodStasis: 1 } },
      { label: "腰の重さが一番気になる", scores: { kidney: 3, qiDef: 1, water: 1 } },
      { label: "該当しない・特にない", scores: {} }
    ]
  },
  {
    id: "respDefense",
    title: "呼吸・外気への弱さは？",
    choices: [
      { label: "かぜをひきやすいことが一番気になる", scores: { lung: 3, qiDef: 2 } },
      { label: "鼻や喉の不調が一番気になる", scores: { lung: 3, water: 1 } },
      { label: "胸のつかえ感が一番気になる", scores: { lung: 2, qiStag: 2, heart: 1 } },
      { label: "該当しない・呼吸器や鼻はおおむね安定している", scores: {} }
    ]
  }
];

const branchQuestions = [
  {
    id: "femaleCycle",
    phase: "女性向け追加質問",
    condition: answers => answers.gender === "female",
    title: "月経・更年期まわりで近いものは？",
    choices: [
      { label: "月経痛やPMSが一番気になる", scores: { bloodStasis: 3, liver: 3 } },
      { label: "経血量の少なさが一番気になる", scores: { bloodDef: 3, heart: 1, kidney: 1 } },
      { label: "周期に伴う冷えが一番気になる", scores: { water: 2, spleen: 2, kidney: 1 } },
      { label: "該当しない・特に気になることはない", scores: {} }
    ]
  },
  {
    id: "senior",
    phase: "年代別追加質問",
    condition: answers => ["60s", "70plus"].includes(answers.ageBand),
    title: "年齢とともに気になりやすくなったことは？",
    choices: [
      { label: "腰や膝の不調が一番気になる", scores: { kidney: 4, qiDef: 1 } },
      { label: "息切れしやすさが一番気になる", scores: { lung: 2, qiDef: 2, bloodDef: 1 } },
      { label: "食が細くなったことが一番気になる", scores: { spleen: 3, qiDef: 2 } },
      { label: "該当しない・特に大きな変化はない", scores: {} }
    ]
  },
  {
    id: "highStress",
    phase: "ストレス追加質問",
    condition: answers => ["high", "veryHigh"].includes(answers.stress),
    title: "ストレスが強い時、どこに出やすいですか？",
    choices: [
      { label: "いらいらとして出やすい", scores: { liver: 3, qiStag: 2 } },
      { label: "動悸や焦りとして出やすい", scores: { heart: 3, qiCounter: 2 } },
      { label: "胃もたれとして出やすい", scores: { spleen: 3, qiStag: 1 } },
      { label: "喉のつかえとして出やすい", scores: { qiStag: 3, lung: 2 } },
      { label: "該当しない・ストレスで体調に出る感じは少ない", scores: {} }
    ]
  },
  {
    id: "sleepBranch",
    phase: "睡眠追加質問",
    condition: answers => ["light", "short", "irregular"].includes(answers.sleep),
    title: "睡眠トラブルの背景に近いものは？",
    choices: [
      { label: "考えごとで寝つけない", scores: { spleen: 2, heart: 2, qiStag: 1 } },
      { label: "焦りで眠りが浅くなる", scores: { heart: 3, qiCounter: 2 } },
      { label: "ほてりで眠りにくい", scores: { bloodDef: 2, kidney: 2, heart: 1 } },
      { label: "朝の重だるさが強い", scores: { water: 2, spleen: 1 } },
      { label: "該当しない・睡眠トラブルの背景は思い当たらない", scores: {} }
    ]
  }
];

const screen = document.querySelector("#screen");
const form = document.querySelector("#diagnosisForm");
const backButton = document.querySelector("#backButton");
const nextButton = document.querySelector("#nextButton");
const phaseLabel = document.querySelector("#phaseLabel");
const progressCount = document.querySelector("#progressCount");
const progressBar = document.querySelector("#progressBar");

function render() {
  if (state.step === "welcome") renderWelcome();
  if (state.step === "core") renderQuestion(coreQuestions[state.coreIndex], "体質チェック");
  if (state.step === "branch") renderQuestion(state.branchQueue[state.branchIndex], state.branchQueue[state.branchIndex].phase);
  if (state.step === "lead") renderLead();
  if (state.step === "result") renderResult();
  updateProgress();
}

function renderWelcome() {
  screen.innerHTML = document.querySelector("#welcomeTemplate").innerHTML;
  setValues(["ageBand", "gender", "sleep", "stress"], state.answers);
  backButton.disabled = true;
  nextButton.textContent = "診断を始める";
}

function renderQuestion(question, phase) {
  const selected = state.answers[question.id];
  screen.innerHTML = `
    <div class="screen-block">
      <h2>${question.title}</h2>
      <p class="note">一番近いものを選んでください。迷う場合は、直近1か月でよくある状態を優先します。</p>
      <div class="question-list">
        ${question.choices.map((choice, index) => `
          <label class="choice">
            <input type="radio" name="${question.id}" value="${index}" ${String(index) === String(selected) ? "checked" : ""} required>
            <span>${choice.label}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
  phaseLabel.textContent = phase;
  backButton.disabled = false;
  nextButton.textContent = isLastQuestion() ? "結果入力へ" : "次へ";
}

function renderLead() {
  screen.innerHTML = `
    <div class="screen-block">
      <h2>結果を見る前に、連絡先を入力してください</h2>
      <p class="note">
        診断結果の控えや個別相談の案内に使う想定の入力欄です。
        静的版ではブラウザ内に保存し、Webhook設定時は外部にも送信します。
      </p>
      <div class="field-grid">
        <label>
          お名前
          <input name="name" autocomplete="name" required value="${escapeHtml(state.lead.name || "")}">
        </label>
        <label>
          メールアドレス
          <input name="email" type="email" autocomplete="email" required value="${escapeHtml(state.lead.email || "")}">
        </label>
      </div>
      <div class="lead-box">
        <strong>注意</strong>
        <p class="small">
          この結果は東洋医学・中医学的な体質傾向の整理で、病気の診断ではありません。
          症状が強い、急に悪化した、長く続く、日常生活に支障がある場合は医療機関に相談してください。
        </p>
      </div>
    </div>
  `;
  phaseLabel.textContent = "連絡先入力";
  backButton.disabled = false;
  nextButton.textContent = "診断結果を見る";
}

function renderResult() {
  const result = state.result || calculateResult();
  state.result = result;
  screen.innerHTML = `
    <div class="screen-block result">
      <div class="result-hero">
        <p class="type-label">${escapeHtml(state.lead.name || "あなた")}さんの主な体質傾向</p>
        <h2>${result.kisuiketsu.label} × ${result.organ.label}タイプ</h2>
        <p>${result.summary}</p>
      </div>
      <div>
        <h3>気血水の上位傾向</h3>
        <div class="score-grid">
          ${result.topKisuiketsu.map(item => scoreCard(item.label, item.text, item.percent)).join("")}
        </div>
      </div>
      <div>
        <h3>五臓の上位傾向</h3>
        <div class="score-grid">
          ${result.topOrgans.map(item => scoreCard(item.label, item.text, item.percent)).join("")}
        </div>
      </div>
      <div class="lead-box">
        <strong>養生の方向性</strong>
        <p>${result.care}</p>
        <p class="small">
          漢方薬やサプリメントは体質、持病、併用薬によって合わない場合があります。
          自己判断で開始・増量・長期継続せず、医師・薬剤師に相談してください。
        </p>
      </div>
      <div class="cta-box">
        <strong>次のアクション</strong>
        <div class="result-links">
          <a class="result-link result-link--primary" href="https://www.hgintakah.com/20250116192544" target="_blank" rel="noopener noreferrer">医師に相談する</a>
          <a class="result-link result-link--secondary" href="https://repeak.aiandwill.com/lp/repeak/?_gl=1*1lnj0jx*_gcl_au*NjY4NTYzODgyLjE3NzU1MjUwNjU.*_ga*MTcwOTg3NDg1Ny4xNzc1NTI1MDY0*_ga_1TE7QK2DMK*czE3Nzc3ODMyNDMkbzQkZzAkdDE3Nzc3ODMyNDMkajYwJGwwJGgw" target="_blank" rel="noopener noreferrer">すぐに体質を整える</a>
        </div>
      </div>
      <button class="button button--ghost" type="button" id="restartButton">もう一度診断する</button>
    </div>
  `;
  document.querySelector("#restartButton").addEventListener("click", reset);
  phaseLabel.textContent = "診断結果";
  backButton.disabled = true;
  nextButton.style.display = "none";
}

function scoreCard(label, text, percent) {
  return `
    <div class="score-card">
      <strong>${label}</strong>
      <p class="small">${text}</p>
      <div class="meter" aria-hidden="true"><span style="--value:${percent}%"></span></div>
    </div>
  `;
}

function updateProgress() {
  const total = 1 + coreQuestions.length + state.branchQueue.length + 1 + (state.step === "result" ? 1 : 0);
  let current = 1;
  if (state.step === "core") current = 2 + state.coreIndex;
  if (state.step === "branch") current = 2 + coreQuestions.length + state.branchIndex;
  if (state.step === "lead") current = 1 + coreQuestions.length + state.branchQueue.length + 1;
  if (state.step === "result") current = total;
  progressCount.textContent = `${Math.min(current, total)} / ${total}`;
  progressBar.style.width = `${Math.round((Math.min(current, total) / total) * 100)}%`;
  if (state.step !== "result") nextButton.style.display = "";
}

function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  const invalid = validateCurrent(data);
  clearError();
  if (invalid) return showError(invalid);
  state.history.push(snapshot());

  if (state.step === "welcome") {
    Object.assign(state.answers, Object.fromEntries(data.entries()));
    state.branchQueue = branchQuestions.filter(q => q.condition(state.answers));
    state.step = "core";
    state.coreIndex = 0;
  } else if (state.step === "core") {
    const question = coreQuestions[state.coreIndex];
    state.answers[question.id] = data.get(question.id);
    if (state.coreIndex < coreQuestions.length - 1) {
      state.coreIndex += 1;
    } else if (state.branchQueue.length) {
      state.step = "branch";
      state.branchIndex = 0;
    } else {
      state.step = "lead";
    }
  } else if (state.step === "branch") {
    const question = state.branchQueue[state.branchIndex];
    state.answers[question.id] = data.get(question.id);
    if (state.branchIndex < state.branchQueue.length - 1) {
      state.branchIndex += 1;
    } else {
      state.step = "lead";
    }
  } else if (state.step === "lead") {
    state.lead = Object.fromEntries(data.entries());
    state.result = calculateResult();
    persistLead();
    state.step = "result";
  }
  render();
}

function validateCurrent(data) {
  if (state.step === "welcome") {
    return ["ageBand", "gender", "sleep", "stress"].some(name => !data.get(name)) ? "すべての基本情報を選択してください。" : "";
  }
  if (state.step === "core") {
    return data.get(coreQuestions[state.coreIndex].id) === null ? "回答を1つ選択してください。" : "";
  }
  if (state.step === "branch") {
    return data.get(state.branchQueue[state.branchIndex].id) === null ? "回答を1つ選択してください。" : "";
  }
  if (state.step === "lead") {
    if (!data.get("name") || !data.get("email")) return "お名前とメールアドレスを入力してください。";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email")) ? "" : "メールアドレスの形式を確認してください。";
  }
  return "";
}

function calculateResult() {
  const scores = {};
  Object.keys(dimensions.kisuiketsu).forEach(key => scores[key] = 0);
  Object.keys(dimensions.organs).forEach(key => scores[key] = 0);

  applyDemographicScores(scores);
  [...coreQuestions, ...state.branchQueue].forEach(question => {
    const choice = question.choices[Number(state.answers[question.id])];
    if (!choice) return;
    Object.entries(choice.scores).forEach(([key, value]) => {
      scores[key] = (scores[key] || 0) + value;
    });
  });

  const topKisuiketsu = topItems(dimensions.kisuiketsu, scores, 3);
  const topOrgans = topItems(dimensions.organs, scores, 3);
  const primaryK = topKisuiketsu[0];
  const primaryO = topOrgans[0];

  return {
    kisuiketsu: primaryK,
    organ: primaryO,
    topKisuiketsu,
    topOrgans,
    summary: buildSummary(primaryK, primaryO),
    care: buildCare(primaryK.key, primaryO.key)
  };
}

function applyDemographicScores(scores) {
  if (state.answers.gender === "female") {
    scores.bloodDef += 0.5;
    scores.kidney += 0.5;
  }
  if (state.answers.gender === "male") {
    scores.water += 0.5;
    scores.spleen += 0.5;
  }
  if (["20s", "30s"].includes(state.answers.ageBand)) {
    scores.qiStag += 0.5;
  }
  if (["60s", "70plus"].includes(state.answers.ageBand)) {
    scores.qiDef += 0.5;
    scores.kidney += 0.75;
  }
  if (state.answers.sleep === "light") scores.heart += 0.75;
  if (state.answers.sleep === "short") scores.qiDef += 0.5;
  if (state.answers.sleep === "irregular") scores.qiStag += 0.5;
  if (state.answers.stress === "high") scores.liver += 0.75;
  if (state.answers.stress === "veryHigh") {
    scores.liver += 1;
    scores.qiStag += 0.75;
  }
}

function topItems(source, scores, count) {
  const max = Math.max(...Object.keys(source).map(key => scores[key] || 0), 1);
  return Object.entries(source)
    .map(([key, item]) => ({ key, ...item, score: scores[key] || 0, percent: Math.max(8, Math.round(((scores[key] || 0) / max) * 100)) }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ja"))
    .slice(0, count);
}

function buildSummary(kisuiketsu, organ) {
  return `現在の回答では、${kisuiketsu.label}の傾向と、漢方医学的な${organ.label}の失調傾向が重なって見られます。${kisuiketsu.text}が、${organ.text}として表れやすい状態として整理できます。`;
}

function buildCare(kKey, organKey) {
  const careByK = {
    qiDef: "予定を詰めすぎず、睡眠と食事のリズムを整え、消耗を増やす無理な運動より軽い散歩や呼吸を優先します。",
    qiStag: "緊張をため込まないよう、深呼吸、首肩まわりのストレッチ、短い休憩をこまめに入れることが向きます。",
    qiCounter: "のぼせや焦りが強い日は、刺激物・夜更かし・詰め込みを控え、クールダウンの時間を先に確保します。",
    bloodDef: "睡眠不足を避け、食事を抜かず、乾燥や目の酷使を増やしすぎない生活設計が合いやすいです。",
    bloodStasis: "長時間同じ姿勢を避け、温める・軽く動かす・締めつけを減らすなど、巡りを妨げにくい習慣が助けになります。",
    water: "冷たい飲食や過剰な水分摂取を見直し、汗ばむ程度の軽い運動と胃腸に負担の少ない食事を意識します。"
  };
  const careByOrgan = {
    liver: "ストレス反応が体に出やすいので、仕事量、睡眠、月経周期や肩首の状態を一緒に記録すると傾向をつかみやすくなります。",
    heart: "睡眠と自律神経の揺れが中心に出やすいため、就寝前の情報量、カフェイン、夜間作業を調整します。",
    spleen: "胃腸の回復が軸です。食事時間、量、冷たいもの、甘いもの、食後の眠気を観察します。",
    lung: "鼻・喉・皮膚・呼吸の乾燥や過敏さに注意し、室内環境と休息を整えます。",
    kidney: "冷え、腰、睡眠、泌尿、加齢に伴う消耗をセットで見て、疲れを翌日に持ち越さない配分を優先します。"
  };
  return `${careByK[kKey]} ${careByOrgan[organKey]}`;
}

function persistLead() {
  const payload = {
    createdAt: new Date().toISOString(),
    lead: state.lead,
    demographics: {
      ageBand: state.answers.ageBand,
      gender: state.answers.gender,
      sleep: state.answers.sleep,
      stress: state.answers.stress
    },
    result: {
      type: `${state.result.kisuiketsu.label} × ${state.result.organ.label}`,
      kisuiketsu: state.result.topKisuiketsu.map(({ label, score }) => ({ label, score })),
      organs: state.result.topOrgans.map(({ label, score }) => ({ label, score }))
    },
    answers: state.answers
  };

  try {
    const leads = JSON.parse(localStorage.getItem("aiTaishitsuLeads") || "[]");
    leads.push(payload);
    localStorage.setItem("aiTaishitsuLeads", JSON.stringify(leads));
  } catch (error) {
    console.warn("Lead storage failed", error);
  }

  if (LEAD_WEBHOOK_URL) {
    fetch(LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(error => console.warn("Lead webhook failed", error));
  }
}

function isLastQuestion() {
  if (state.step === "core") return state.coreIndex === coreQuestions.length - 1 && state.branchQueue.length === 0;
  if (state.step === "branch") return state.branchIndex === state.branchQueue.length - 1;
  return false;
}

function snapshot() {
  return JSON.parse(JSON.stringify({
    step: state.step,
    answers: state.answers,
    coreIndex: state.coreIndex,
    branchQueue: state.branchQueue,
    branchIndex: state.branchIndex,
    lead: state.lead,
    result: state.result
  }));
}

function goBack() {
  const previous = state.history.pop();
  if (!previous) return;
  Object.assign(state, previous);
  render();
}

function reset() {
  Object.assign(state, {
    step: "welcome",
    history: [],
    answers: {},
    coreIndex: 0,
    branchQueue: [],
    branchIndex: 0,
    lead: {},
    result: null
  });
  render();
}

function setValues(names, values) {
  names.forEach(name => {
    const field = screen.querySelector(`[name="${name}"]`);
    if (field && values[name]) field.value = values[name];
  });
}

function showError(message) {
  const error = document.createElement("p");
  error.className = "error";
  error.textContent = message;
  screen.appendChild(error);
}

function clearError() {
  const error = screen.querySelector(".error");
  if (error) error.remove();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", handleSubmit);
backButton.addEventListener("click", goBack);
render();
