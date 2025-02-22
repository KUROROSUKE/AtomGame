let ai_hand = [];
let pl_hand = [];

let ai_selected_cards = [];
let ai_selected_place = [];
let pl_selected_cards = [];
let pl_selected_place = [];

let make_material = {};

let pl_point = 0;
let ai_point = 0;

let card_num = 8;

let pl_data = [];
let ai_data = [];

const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,"Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20,"Fe": 26, "Cu": 29, "Zn": 30, "I": 53};
const elements = [...Array(30).fill('H'), ...Array(25).fill('O'), ...Array(20).fill('C'),'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I'];
const element = ['H','O','C','He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']

let materials;
let imageCache = {};
let turn;

const ai_hand_div = document.getElementById('ai_hand');
ai_hand_div.classList.add('disabled');



function startGame() {
    document.getElementById("ai_div").style.display = "inline-block";
    document.getElementById("pl_div").style.display = "inline-block";
    make_initial_hand();
    console.log(ai_hand,pl_hand)
    turn = (Math.random() > 0.5) ? 'ai':'pl';
    console.log(turn);
    if (turn == 'ai') {view_pl_hand();ai_turn()};
    if (turn == 'pl') {view_ai_hand();pl_turn()};
}

async function loadMaterials() {
    const response = await fetch('../compound/standard.json');
    const data = await response.json();
    if (!data.material || !Array.isArray(data.material)) {
        console.error('Loaded data does not contain a valid "material" array:', data);
        return [];
    }
    materials = data.material;
}

async function preloadImages() {
    let imageNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 53];

    imageNumbers.forEach(num => {
        let img = new Image();
        img.src = `../image/${num}.webp`;
        imageCache[num] = img;
    });
    console.log(imageCache)
}


document.addEventListener("DOMContentLoaded", function(){
    loadMaterials();
    preloadImages();
})

document.getElementById('pl_exchange_button').addEventListener('click',function() {
    pl_exchange();
})

document.getElementById('pl_generate_button').addEventListener('click',function() {
    pl_generate();
})

document.getElementById('pl_hint_button').addEventListener('click' , function() {
    document.getElementById('chemicalTable').classList.toggle('hidden');
    display_pl_hint();
})

async function ai_turn() {
    if (turn == 'ai') {
        view_ai_hand();
        document.getElementById('pl_exchange_button').classList.add('disabled');
        document.getElementById('pl_generate_button').classList.add('disabled');

        if (!document.getElementById('chemicalTable').classList.contains('hidden')) {
            document.getElementById('chemicalTable').classList.toggle('hidden');
        }
        make_material = await ai_make_materials();
        console.log(make_material);
        if (make_material == null) {
            console.log('exchange');
            let ai_exchange_material = await ai_exchange_materials();
            await select_ai_cards(ai_exchange_material);
            ai_exchange();
        } else {
            await select_ai_cards(make_material.components);
            ai_generate();
        }
    }
}

async function ai_exchange_materials() {
    const count = ai_hand.reduce((acc, elem) => {
        acc[elem] = (acc[elem] || 0) + 1;
        return acc;
    }, {});

    let minElement = null;
    let minCount = Infinity;
    for (const [element, num] of Object.entries(count)) {
        if (num < minCount) {
            minElement = element;
            minCount = num;
        }
    }

    let exchangeCards = {};
    exchangeCards[minElement] = minCount;

    return exchangeCards;
}


function pl_turn() {
    if (turn == 'pl'){
        view_pl_hand();
        document.getElementById('pl_exchange_button').classList.remove('disabled');
        document.getElementById('pl_generate_button').classList.remove('disabled');
    }
}

function ai_exchange() {
    if (ai_selected_cards.length >= 1) {
        ai_data.push({
            hand: [ai_hand.slice()], // 現在の手札のコピーを保存
            action: 'exchange',
            selected: array_to_obj(ai_selected_cards) // 選択されたカードをオブジェクトとして保存
        });
        ai_selected_place.forEach((elem,index) => {
            if (elem == 1) {
                ai_hand[index] = get_random_card();
                let ai_card = document.getElementsByClassName('ai_card')[index];
                if (ai_card.classList.contains('selected')) {ai_card.click()};
            };
        });
        turn = 'pl';
        view_ai_hand();
        win_check();
        pl_turn();
    } else {
        document.getElementById('ai_text').innerHTML = 'カードを選択してください'
    }
}

function pl_exchange() {
    if (pl_selected_cards.length >= 1) {
        pl_data.push({
            hand: [pl_hand.slice()], // 現在の手札のコピーを保存
            action: 'exchange',
            selected: array_to_obj(pl_selected_cards) // 選択されたカードをオブジェクトとして保存
        });
        pl_selected_place.forEach((elem,index) => {
            if (elem == 1) {
                pl_hand[index] = get_random_card();
                const pl_card = document.getElementsByClassName('pl_card')[index];
                pl_card.click();
            };
        });
        turn = 'ai';
        view_pl_hand();
        win_check();
        ai_turn();
    } else {
        document.getElementById('pl_text').innerHTML = 'カードを選択してください';
    }
}


async function ai_generate() {
    if (ai_selected_cards.length >= 1) {
        let generate_material = await search_material(array_to_obj(ai_selected_cards));
        if (generate_material[0] != null) {
            ai_point += generate_material[0].point;
            document.getElementById('ai_point').innerHTML = `AIのポイント： ${ai_point}`;
            document.getElementById('ai_text').innerHTML = `${generate_material[0].name} ： ${generate_material[0].formula}`;
            ai_data.push({
                hand: [ai_hand.slice()], // 現在の手札のコピーを保存
                action: 'generate',
                selected: array_to_obj(ai_selected_cards) // 修正: 選択されたカードをオブジェクトとして保存
            });
            ai_exchange();
        } else {
            document.getElementById('ai_text').innerHTML = '該当の物質がありません';
            ai_exchange();
        }
    } else {
        document.getElementById('ai_text').innerHTML = 'カードを選択してください';
        ai_exchange();
    }
}

async function pl_generate() {
    if (pl_selected_cards.length >= 1) {
        let generate_material = await search_material(array_to_obj(pl_selected_cards));
        if (generate_material[0] != null) {
            pl_point += generate_material[0].point;
            document.getElementById('pl_point').innerHTML = `プレイヤーのポイント： ${pl_point}`;
            document.getElementById('pl_text').innerHTML = `${generate_material[0].name} ： ${generate_material[0].formula}`;
            pl_data.push({
                hand: [pl_hand.slice()], // 現在の手札のコピーを保存
                action: 'generate',
                selected: array_to_obj(pl_selected_cards) // 修正: 選択されたカードをオブジェクトとして保存
            });
            pl_exchange();
        } else {
            document.getElementById('pl_text').innerHTML = '該当の物質がありません';
            pl_selected_cards = []
            pl_selected_place = [0,0,0,0,0,0,0,0]
            turn = 'ai';
            view_pl_hand();
            win_check();
            ai_turn();
        }
    } else {
        document.getElementById('pl_text').innerHTML = 'カードを選択してください';
    }
}


function view_ai_hand() {
    const Hand_div = document.getElementById('ai_hand');
    Hand_div.innerHTML = '';
    ai_hand.forEach((elem,index) => {
        const img = document.createElement('img');
        img.id = index;
        img.alt = elem;
        img.src = imageCache[elementToNumber[img.alt]].src;
        img.style.height = 'auto';
        img.style.border = '1px solid black';
        img.style.padding = '5px';
        img.className = 'ai_card';
        img.addEventListener('click', function() {
            if (turn == 'ai') {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    this.style.padding = '5px'
                    this.style.border = '1px solid black';
                    ai_selected_cards.splice(ai_selected_cards.indexOf(this.alt),1);
                    ai_selected_place[this.id] = 0;
                } else {
                    this.classList.add('selected');
                    this.style.padding = '1px'
                    this.style.border = '5px solid red';
                    ai_selected_cards.push(this.alt);
                    ai_selected_place[this.id] = 1;
                }
            }
        })
        Hand_div.appendChild(img);
    })
}

function view_pl_hand() {
    const Hand_div = document.getElementById('pl_hand');
    Hand_div.innerHTML = '';
    pl_hand.forEach((elem,index) => {
        const img = document.createElement('img');
        img.id = index;
        img.alt = elem;
        img.src = imageCache[elementToNumber[img.alt]].src;
        img.style.height = 'auto';
        img.style.border = '1px solid black';
        img.style.padding = '5px';
        img.className = 'pl_card';
        img.addEventListener('click', function() {
            if (turn == 'pl') {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    this.style.padding = '5px';
                    this.style.border = '1px solid black';
                    pl_selected_cards.splice(pl_selected_cards.indexOf(this.alt),1);
                    pl_selected_place[this.id] = 0;
                } else {
                    this.classList.add('selected');
                    this.style.padding = '1px';
                    this.style.border = '5px solid red';
                    pl_selected_cards.push(this.alt);
                    pl_selected_place[this.id] = 1;
                }
            }
        })
        Hand_div.appendChild(img);
    })
}

function get_random_card() {
    return elements[Math.floor(Math.random() * elements.length)];
}
function make_initial_hand() {
    for (let i=0;i<card_num;i++) {
        ai_hand.push(get_random_card());
        pl_hand.push(get_random_card());
    }
}

async function search_material(components) {
    return materials.filter(material => {
        for (const element in components) {
            if (!material.components[element] || material.components[element] !== components[element]) {
                return false;
            }
        }
        for (const element in material.components) {
            if (!components[element]) {
                return false;
            }
        }
        return true;
    })
}

function search_materials(components) {
    return materials.filter(material => {
        for (const element in material.components) {
            if (!components[element] || material.components[element] > components[element]) {
                return false;
            }
        }
        return true
    });
}

async function ai_make_materials() {
    const components = ai_hand.reduce((acc, element) => {
        acc[element] = (acc[element] || 0) + 1;
        return acc;
    }, {});
    const matchingMaterials = search_materials(components, materials);

    // 生成できる物質がない場合にnullを返す
    if (!matchingMaterials.length) {
        return null;
    }

    var max_point = 0;
    var max_point_index = 0;
    matchingMaterials.forEach((material) => {
        if (material.point > max_point) {
            max_point_index = materials.indexOf(material);
            max_point = material.point;
        }
    });

    return materials[max_point_index];
}


async function display_pl_hint() {
    const components = pl_hand.reduce((acc, element) => {
        acc[element] = (acc[element] || 0) + 1;
        return acc;
    }, {});
    const matchingMaterials = search_materials(components, materials);
    
    const tableBody = document.getElementById('chemicalTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    
    matchingMaterials.forEach(chemical => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = chemical.name;
        row.insertCell().textContent = chemical.formula;
        row.insertCell().textContent = chemical.point;

        const componentsArray = Object.entries(chemical.components).map(([key, value]) => `${key}:${value}`);
        row.insertCell().textContent = componentsArray.join(', ');
    });
}


function obj_to_array(obj) {
    let result = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            for (let i = 0; i < obj[key]; i++) {
                result.push(key);
            }
        }
    }
    return result;
}

function array_to_obj(array) {
    let result = {};
    array.forEach(item => {
        if (result[item]) {
            result[item]++;
        } else {
            result[item] = 1;
        }
    });
    return result;
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
}

function search_need_select(need_cards) {
    let select_place = [];
    const img = document.getElementsByClassName('ai_card');
    for (var index=0;index < 8;index++) {
        if (need_cards.includes(img[index].alt)) {
            select_place.push(index);
            need_cards.splice(need_cards.indexOf(img[index].alt),1);
        };
    };
    return select_place;
}

async function select_ai_cards(need_cards) {
    need_cards = obj_to_array(need_cards);
    const img = document.getElementsByClassName('ai_card');
    let select_places = await search_need_select(need_cards);
    for (var index=0;index < 8;index++) {
        if (select_places.includes(index)) {
            img[index].click();
            await delay();
        };
    };
}

async function ai_exchange_materials() {
    const count = ai_hand.reduce((acc, elem) => {
        acc[elem] = (acc[elem] || 0) + 1;
        return acc;
    }, {});
    let minElement = null;
    let minCount = Infinity;
    for (const [element, num] of Object.entries(count)) {
        if (num < minCount) {
            minElement = element;
            minCount = num;
        }
    }
    return { [minElement]: minCount };
}

function win_check() {
    if (pl_point >= 250 || ai_point >= 250) {
        turn = 'end';
        const winner = pl_point >= 250 ? 'プレイヤー' : 'AI';
        return winner
    } else {
        return false;
    };
}
