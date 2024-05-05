const DEBUG = false;

const clearContent = () => {
    const content = select(".content"); 
    content.innerHTML = "";
    return content;
};

const getTasks = () => {
    return JSON.parse(localStorage.getItem("citações"));
};

const updateTasks = (taskHolder, task) => {
    const tasks = getTasks();    
    tasks.push(task);
    localStorage.setItem("citações", JSON.stringify(tasks));
    renderTasks(taskHolder);
};

let lastOrder = 0;

const renderTasks = (taskHolder) => {
    const backgroundColors = ["#e97e40","#a5d1e7", "#f4dd65", "#86c753", "#6fa0b2", "#e6bfb9"];
    taskHolder.innerHTML = "";
    getTasks().forEach((taskData, i) => {
        const task = appendElem(taskHolder, "div", ['task-block']);
        const quoteWrapper = appendElem(task, "div", ['task-name-wrapper']);
        appendElem(quoteWrapper, "span", ['task-name'], taskData.name);
        const icon = appendElem(quoteWrapper, "img", ['task-img']);
        let num = getRandomInt(6) + 1;

        icon.src = "img/icons/icon" + num + ".png";

        task.style.backgroundColor = backgroundColors[i % backgroundColors.length];
    });
};

const initHome = () => {
    const content = clearContent();
    appendElem(content, "p", ['slight-header'], "Painel de Controle");
    appendElem(content, "p", [], formatDate());
    const hiBlock = appendElem(content, "div", ["hi-block"]);
    appendElem(hiBlock, "p", ["slight-header"], "Oi, " + localStorage.getItem("userName"));
    appendElem(hiBlock, "p", ["gray-text"], "Não se preocupe, você vai superar isso!");
    appendElem(hiBlock, "p", ["gray-text"], "Preparamos algumas dicas sobre como manter a saúde mental!");
    const umbrellaCat = appendElem(hiBlock, "img", ['umbrella-cat']);
    umbrellaCat.src = "img/cat-umbrella.png";

    const taskHolder = createElem("div", ['task-holder']);
    renderTasks(taskHolder);
    content.appendChild(taskHolder);

    const taskAdder = appendElem(content, "div", ['task-adder']);
    const addTask = appendElem(taskAdder, "div", ['task-block', 'task-add']);
    appendElem(addTask, "p", ['task-prompt'], "Algo inspirador?");
    const taskNameInput = appendElem(addTask, "input", ['task-name-input']);
    const addTaskButton = appendElem(addTask, "div", ['action-button'], "Adicionar novo pensamento");
    addTaskButton.addEventListener("click", () => {
        let name = taskNameInput.value;
        updateTasks(taskHolder, {
            name: name,
        });
    });
};

const cmp = (a, b) => {
    return Math.abs(a - b) < 1e-5;
};

const initGraph = () => {
    const content = clearContent();
    appendElem(content, "p", ['slight-header'], "Gráfico de Emoções");
    const graphHolder = appendElem(content, "div", ['graph-holder']);

    let diaryEntries = JSON.parse(localStorage.getItem("diary-entries"));
    console.log(diaryEntries);
    const graphData = {
        chart: {
            type: 'area',
            colors: ["#e0b389"],
            toolbar: {
                show: false
            }
        },
        theme: {
            palette: 'palette3',
        },
        series: [],
        xaxis: { 
            categories : [] 
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    if (cmp(value, 3)) {
                        return "bom  ";
                    }
                    if (cmp(value, 2)) {
                        return "neutro  ";
                    }
                    if (cmp(value, 1)) {
                        return "ruim  ";
                    }
                    return "";
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            curve: 'smooth',
        }
    }

    const seriesObj = {
        name: 'mood',
        data: [],
    }

    const moodMap = {
        'good': 3,
        'neutral': 2,
        'bad': 1
    };

    let sortedDiaryEntries = diaryEntries.sort((a, b) => {
        let da = new Date(a.date);    
        let db = new Date(b.date);    
        return da.getTime() < db.getTime();
    });

    sortedDiaryEntries.forEach(entry => {
        seriesObj.data.push(moodMap[entry.mood]);
        graphData.xaxis.categories.push(entry.date);
    });

    graphData.series.push(seriesObj);

    const chart = new ApexCharts(graphHolder, graphData);

    chart.render();
};

const initWordCloud = () => {
    let wordsData = localStorage.getItem("words");
    const content = clearContent();
    appendElem(content, "p", ['slight-header'], "Nuvem de Palavras");

    if (!wordsData) {
        wordsData = "Ainda sem dados!";
    }
    const pleaseWait = appendElem(content, "p", ['gray-text'], "Gerando sua nuvem de palavras, por favor aguarde...");

    const wordCloudWrapper = appendElem(content, "div", ['word-cloud-wrapper']);
    const wordCloudImage = appendElem(wordCloudWrapper, "img", ['word-cloud-image'], "");

    getPicture(wordCloudWrapper, wordsData)
        .then(result => {
            wordCloudImage.src = result;
            pleaseWait.innerHTML = "";
        });
};

const initArticle = (article) => {
    showModalWindow();
    const modalWindow = refresh(".modal-window");
    modalWindow.classList.add('tall-modal');
    const crossWrapper = appendElem(modalWindow, "div", ['article-cross-wrapper']);
    const crossImg = appendElem(crossWrapper, "img", ['article-cross-img']);
    crossImg.src = "./img/cross.webp";
    crossImg.addEventListener("click", () => {
        modalWindow.classList.remove('tall-modal');
        hideModalWindow();  
    });

    const articleWrapper = appendElem(modalWindow, "div", ['article-text-wrapper']);

    appendElem(articleWrapper, "p", ['big-header'], article.name);
    article.content.forEach(piece => {
        appendElem(articleWrapper, "p", ['slight-header'], piece.header);
        piece.text.split("\n").forEach((thispiece) => {
            appendElem(articleWrapper, "p", [], thispiece);
        })
    })
};

const initTest = () => {
    const content = clearContent();
    appendElem(content, "p", ['big-header'], "Doenças Mentais");
    appendElem(content, "p", ['gray-text'], "Se você notar alguns dos seguintes sintomas,");
    appendElem(content, "p", ['gray-text'], "provavelmente deveria consultar um médico.");
    const articleWrapper = appendElem(content, "div", ['article-wrapper']);
    const articles = getArticles();
    articles.forEach(article => {
        const articleBlock = appendElem(articleWrapper, "div", ['article']); 
        const apiw = appendElem(articleBlock, "div", ['article-preview-image-wrapper']);
        const api = appendElem(apiw, "img", ['article-preview-image']);
        api.src = "./img/articles/" + article.picname + ".jpg";
        appendElem(articleBlock, "p", ['article-header'], article.artname);

        articleBlock.addEventListener("click", () => initArticle(article));
    });
};

const initAbout = () => {
    const content = clearContent();
    const articleContent = [
        "A ansiedade é um problema comum que afeta muitas pessoas em todo o mundo. Pode ser desencadeada por várias razões, como estresse, preocupações, medos e traumas passados.",
        "É por isso que criamos Lumina - um rastreador de humor leve e eficiente, conselheiro e motivador geral para ajudá-lo a lidar com a ansiedade e melhorar sua saúde mental.",
        "",
        "Contribuidores:",
        "Hyago Fellipe de Oliveira Soares",
        "João Victor Freire de Matos Barbosa",
        "João Paulo Alves Leal Borges"
    ]

    appendElem(content, "p", ['slight-header'], 
        "A ansiedade é um problema comum que afeta muitas pessoas em todo o mundo.");

    articleContent.forEach(text => {
        appendElem(content, "p", ['about-text'], text);    
    });
};

const initNavigation = () => {
    const buttons = ['home', 'graph', 'word-cloud', 'test', 'about'];
    const initers = [initHome, initGraph, initWordCloud, initTest, initAbout];
    const buttonsContainer = select(".nav-buttons-container");    

    buttons.forEach((button, i) => {
        let curButton = appendElem(buttonsContainer, "div", ['nav-button', button]);
        let navIcon = appendElem(curButton, "img", ['nav-icon']);
        navIcon.src = "./img/nav-icons/" + button + ".png";
        curButton.addEventListener("click", () => {
            const prev = select(".cur-section");
            if (prev) {
                prev.classList.remove("cur-section");
            }
            curButton.classList.add("cur-section");
            initers[i]();
        });
    });
};

const processNoteData = (badGoodNeutral, noteText, dateString) => {
    updateWordCloud(noteText);
    updateDiaryEntry(badGoodNeutral, dateString);
};

const initModalWindow = () => {
    const modalWindow = refresh(".modal-window");
    appendElem(modalWindow, "p", ['slight-header'], "Como foi o seu dia?");
    const emoticonsHolder = appendElem(modalWindow, "div", ['emoticons-holder']);

    let selected = null;
    let selectedValue = null;
    ['bad', 'neutral', 'good'].forEach(name => {
        const emoteWrapper = appendElem(emoticonsHolder, "div", ['emoticon']);
        const emoteImage = appendElem(emoteWrapper, "img", ['emoticon-image', 'emoticon-' + name]);
        emoteImage.src = "img/emotions/" + name + ".png";
        emoteWrapper.addEventListener("click", () => {
            if (selected == emoteWrapper) {
                emoteWrapper.classList.remove("selected-emoticon");
                selected = null;
            } else {
                if (selected) {
                    selected.classList.remove("selected-emoticon"); 
                }
                emoteWrapper.classList.add("selected-emoticon");
                selected = emoteWrapper;
                selectedValue = name;
            }
        });
    });

    appendElem(modalWindow, "p", ['slight-header', "on-your-mind"], "Escreva sobre o seu dia");
    appendElem(modalWindow, "p", ['gray-text'], "Você pode criar uma nuvem de palavras a partir destas notas mais tarde.");

    const noteArea = appendElem(modalWindow, "textarea", ["note-area"]);
    const calendar = appendElem(modalWindow, "input", ["datepicker"]);
    calendar.setAttribute("type", "date");
    console.log(calendar.value);

    const submitContainer = appendElem(modalWindow, "div", ['submit-container']);
    appendElem(submitContainer, "p", ['gray-text'], "Vamos pegar sua nota daqui!");
    const discard = appendElem(submitContainer, "div", ['action-button'], "Descartar");
    const submitNote = appendElem(submitContainer, "div", ['action-button'], "Salvar");

    discard.addEventListener("click", () => {
        hideModalWindow();  
    });

    submitNote.addEventListener("click", () => {
        let good = true;
        if (calendar.value == "") {
            pulseRed(calendar);    
            good = false;
        }

        if (selected == null) {
            pulseRed(emoticonsHolder);    
            good = false;
        }

        if (good) {
            processNoteData(selectedValue, noteArea.value, calendar.value);
            hideModalWindow();  
        }
    });
};

const initProfile = (username) => {
    let userGender = localStorage.getItem("userGender");
    if (!userGender) {
        userGender = "octo_shifted";
    }

    const profile = select(".profile");
    profile.innerHTML = "";

    appendElem(profile, "p", ['profile__title'], "Meu perfil");    
    const pictureWrapper = createElem("div", ['profile__avatar-wrapper']);
    const picture = createElem("img", ['profile__avatar-picture']);
    picture.setAttribute('src', 'img/' + userGender + '.png');
    pictureWrapper.appendChild(picture);
    profile.appendChild(pictureWrapper);
    appendElem(profile, "p", ['profile__username'], username);

    if (username !== "Quem é você?") {
        const addMoodForm = appendElem(profile, "div", ['profile__add-mood']);
        appendElem(addMoodForm, "p", ['slight-header'], "Adicionar nota");
        const addMoodImage = appendElem(addMoodForm, "img", ['profile__add-mood-image']);
        addMoodImage.setAttribute("src", "img/calendar.png");

        addMoodForm.addEventListener("click", () => {
            showModalWindow();
            initModalWindow();
        });
    }
};

const register = (name, age) => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userAge", age);
    localStorage.setItem("userGender", select(".radio-gender:checked").value);
    select(".content").classList.remove("center-mode");
    initNavigation();
    initHome();
    initProfile(name);
};

const initWelcomePage = () => {
    const content = select('.content'); 
    content.classList.add("center-mode");
    content.innerHTML = "";
    const buttonsContainer = select(".nav-buttons-container");    
    buttonsContainer.innerHTML = "";

    // const bannerWrapper = appendElem(content, "div", ['welcome-banner-wrapper']);
    // const banner = appendElem(bannerWrapper, "img", ['welcome-banner']);
    // banner.src = "img/pinegirl.png";
    //
    const regWrapper = appendElem(content, "div", ['registration-wrapper']);

    appendElem(regWrapper, "p", ['slight-header', 'big-header'], "Olá! Por favor, apresente-se");
    appendElem(regWrapper, "p", [], "Qual é o seu nome?");
    const nameInput = appendElem(regWrapper, "input", ['input-general'], "");
    appendElem(regWrapper, "p", [], "Quantos anos você tem, querido?");
    const ageInput = appendElem(regWrapper, "input", ['input-general'], "");
    ageInput.type = "number";

    const radioWrapper = appendElem(regWrapper, "div", ['gender-wrapper']);
    ['homem', 'mulher'].forEach(gender => {
        const label = appendElem(radioWrapper, "label", ['container'], gender);
        const input = appendElem(label, "input", ["radio-gender"]);
        input.type = "radio";
        input.name = "gender";
        input.value = gender;
        appendElem(label, "span", ["checkmark"]);
    });

    const registerButton = appendElem(regWrapper, "div", ['action-button'], "Vamos começar!");
    registerButton.addEventListener("click", () => {
        register(nameInput.value, ageInput.value);
    });
};

const cleanLocalStorage = () => {
    let nullables = ["userName", "userAge", "userGender", "words", "quotes"];
    nullables.forEach(propertyName => {
        localStorage.setItem(propertyName, "");  
    });
    localStorage.setItem("diary-entries", "[]"); 
};

const testEntry = () => {
    localStorage.setItem('diary-entries', JSON.stringify([
        {mood: "good", date: '01-01-2020'},
        {mood: "bad", date: '02-01-2020'},
        {mood: "neutral", date: '03-01-2020'},
        {mood: "good", date: '04-01-2020'},
    ]));
    initHome();
};

const init = () => {
    let quotes = [{
        name: "Tough times never last, but tough people do!",
    }, {
        name: "The best way out is always through",
    }, {
        name: "You, yourself, as much as anybody in the entire universe, deserve your love and affection",
    }];

    cleanLocalStorage();
    localStorage.setItem("quotes", JSON.stringify(quotes));

    if (DEBUG) {
        testEntry(); 
    } else {
        let userName = localStorage.getItem('userName');
        if (userName) {
            initNavigation();
            initProfile(userName);
            initHome();
            select(".home").classList.add("cur-section");
        } else {
            initProfile("Sem perfil");
            initWelcomePage();
        }
    }
    document.querySelector(".logout-wrapper").addEventListener("click", () => {
        cleanLocalStorage();
        localStorage.setItem("quotes", JSON.stringify(quotes));
        initProfile("Sem perfil");
        initWelcomePage();
    });
};

document.addEventListener("DOMContentLoaded", init);
