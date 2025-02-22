let p1_hand = [];
let p2_hand = [];

let p1_selected_cards = [];
let p2_selected_cards = [];

let p1_selected_place = [0,0,0,0,0,0,0,0];
let p2_selected_place = [0,0,0,0,0,0,0,0];

let p1_point = 0;
let p2_point = 0;

let turn = 'p1';

let hand_num = 8;

const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,"Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 10, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20,"Fe": 26, "Cu": 29, "Zn": 30, "I": 53};
const elements = [...Array(30).fill('H'), ...Array(25).fill('O'), ...Array(20).fill('C'),'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I'];
const element = ['H','O','C','He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']

function p1_turn() {
    p1_view_hand();
    let p2_generate = document.getElementById('p1_generate');
    let p2_exchange = document.getElementById('p1_exchange');
    p2_generate.ariaDisabled = 'disabled';
    p2_exchange.ariaDisabled = 'disabled';
    let p1_generate = document.getElementById('p1_generate');
    let p1_exchange = document.getElementById('p1_exchange');
    p1_generate.ariaDisabled = null;
    p1_exchange.ariaDisabled = null;
    if (turn == 'p2') {p2_turn()};
}

function p2_turn() {
    p2_view_hand();
    let p1_generate = document.getElementById('p1_generate');
    let p1_exchange = document.getElementById('p1_exchange');
    p1_generate.ariaDisabled = 'disabled';
    p1_exchange.ariaDisabled = 'disabled';
    let p2_generate = document.getElementById('p2_generate');
    let p2_exchange = document.getElementById('p2_exchange');
    p2_generate.ariaDisabled = null;
    p2_exchange.ariaDisabled = null;
    if (turn == 'p1') {p1_turn()};
}

async function p1_generate() {
    if (p1_selected_cards.length != 0) {
        let material
        await search_material(array_to_dict(p1_selected_cards)).then(data => material = data[0]);;
        if (material !== undefined) {
                document.getElementById('p1_text').innerHTML = `<p>生成した物質：　　${material.name} (${material.formula}) - ${material.point} ポイント</p>`;
                p1_point += material.point;
                document.getElementById('p1_point').innerHTML = `<p>プレイヤー１のポイント：${p1_point}</p>`
        } else {
            document.getElementById('p1_text').innerHTML = '該当の物質がありません';
        }
        p1_exchange();
        p1_selected_cards = [];
        p1_selected_place = [0,0,0,0,0,0,0,0];
        turn = 'p2';
    } else {
        document.getElementById('p1_text').innerHTML = 'カードが選択されていません';
    }
}

async function p2_generate() {
    if (p2_selected_cards.length != 0) {
        let material
        await search_material(array_to_dict(p2_selected_cards)).then(data => material = data[0]);;
        if (material !== undefined) {
                document.getElementById('p2_text').innerHTML = `<p>生成した物質：　　${material.name} (${material.formula}) - ${material.point} ポイント</p>`;
                p2_point += material.point;
                document.getElementById('p2_point').innerHTML = `<p>プレイヤー２のポイント：${p2_point}</p>`
        } else {
            document.getElementById('p2_text').innerHTML = '該当の物質がありません';
        }
        p2_exchange();
        p2_selected_cards = [];
        p2_selected_place = [0,0,0,0,0,0,0,0];
        turn = 'p1';
    } else {
        document.getElementById('p2_text').innerHTML = 'カードが選択されていません';
    }
}

function p1_exchange() {
    if (p1_selected_cards.length >= 1) {
        p1_selected_place.forEach((item,index) => {
            if (item == 1) {
                p1_hand[index] = get_random_card();
            };
        });
        p1_selected_cards = [];
        p1_selected_place = [0,0,0,0,0,0,0,0];
        p1_view_hand();
        turn = 'p2';
    } else {
        document.getElementById('p1_text').innerHTML = 'カードが選択されていません';
    }
}

function p2_exchange() {
    if (p2_selected_cards.length >= 1) {
        p2_selected_place.forEach((item,index) => {
            if (item == 1) {
                p2_hand[index] = get_random_card();
            };
        });
        p2_selected_cards = [];
        p2_selected_place = [0,0,0,0,0,0,0,0];
        p2_view_hand();
        turn = 'p1';
    } else {
        document.getElementById('p1_text').innerHTML = 'カードが選択されていません';
    }
}

function p1_view_hand() {
    const Hand_Div = document.getElementById('p1_hand');
    Hand_Div.innerHTML = ``
    p1_hand.forEach((element, index) => {
        const img = document.createElement('img');
        img.src = `../image/${elementToNumber[element]}.png`;
        img.alt = element;
        img.style.width = '60px';
        img.style.margin = '10px';
        img.style.border = '1px solid #000';
        img.className = 'p1';
        img.place = index;
        img.addEventListener('click', function() {
            if (turn == 'p1') {
                if (!this.classList.contains('selected')) {
                    this.classList.add('selected');
                    p1_selected_cards.push(this.alt);
                    p1_selected_place[index] = 1;
                    this.style.transform = 'scale(1.20)';
                    this.style.border = '1px solid #F00';
                } else {
                    this.classList.remove('selected');
                    const cardIndex = p1_selected_cards.indexOf(this.alt);
                    if (cardIndex !== -1) {
                        p1_selected_cards.splice(cardIndex, 1);
                        p1_selected_place[index] = 0;
                    }
                    this.style.transform = 'scale(1.00)';
                    this.style.border = '1px solid #000';
                }
                console.log(p1_selected_cards)
            }
        });
        Hand_Div.appendChild(img);
    });
}

function p2_view_hand() {
    const Hand_Div = document.getElementById('p2_hand');
    Hand_Div.innerHTML = ``
    p2_hand.forEach((element, index) => {
        const img = document.createElement('img');
        img.src = `../image/${elementToNumber[element]}.png`;
        img.alt = element;
        img.style.width = '60px';
        img.style.margin = '10px';
        img.style.border = '1px solid #000';
        img.className = 'p2';
        img.place = index;
        img.addEventListener('click', function() {
            if (turn == 'p2') {
                if (!this.classList.contains('selected')) {
                    this.classList.add('selected');
                    p2_selected_cards.push(this.alt);
                    p2_selected_place[index] = 1;
                    this.style.transform = 'scale(1.20)';
                    this.style.border = '1px solid #F00';
                } else {
                    this.classList.remove('selected');
                    const cardIndex = p2_selected_cards.indexOf(this.alt);
                    if (cardIndex !== -1) {
                        p2_selected_cards.splice(cardIndex, 1);
                        p2_selected_place[index] = 0;
                    }
                    this.style.transform = 'scale(1.00)';
                    this.style.border = '1px solid #000';
                }
                console.log(p2_selected_cards)
            }
        });
        Hand_Div.appendChild(img);
    });
}

async function loadMaterials() {
    const response = await fetch('../compound/standard.json');
    const data = await response.json();
    if (!data.material || !Array.isArray(data.material)) {
        console.error('Loaded data does not contain a valid "material" array:', data);
        return [];
    }
    return data.material;
}

async function search_material(components) {
    const materials = await loadMaterials();
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

function initial_hand() {
    for (i=0;i<=(hand_num - 1);i++) {
        p1_hand.push(elements[Math.floor(Math.random() * elements.length)]);
        p2_hand.push(elements[Math.floor(Math.random() * elements.length)]);
    }
}

function get_random_card() {
    return elements[Math.floor(Math.random() * elements.length)];
}

function array_to_dict(array) {
    const result = {};
    array.forEach(item => {
      if (result[item]) {
        result[item] += 1;
      } else {
        result[item] = 1;
      }
    });
    return result;
}

function reset_size(p1_or_p2) {
    let div = document.getElementById(p1_or_p2);
    let div_img = div.getElementsByTagName('img');
    for (i=0;i<div_img.length;i++){
        div_img[i].style.transform = 'scale(1.00)';
    }
}

function win_check() {
    if (p1_point >= 250 || p2_point >= 250) {
        return p1_point >= 250 ? 'p1':'p2';
    } else {
        return false;
    }
}