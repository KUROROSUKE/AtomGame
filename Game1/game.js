const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10, "Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20, "Fe": 26, "Cu": 29, "Zn": 30, "I": 53};
const numberToElement = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 53]
const elements = [...Array(30).fill('H'), ...Array(25).fill('O'), ...Array(20).fill('C'), 'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'I'];

let currentHand = [];
let selectedElements = {};
let aiHand = [];
let aiPoints = 0;

playerHand = [];
let playerPoints = 0;
let materials = []
let imageCache = {}
let isPlayerTurn = true;

async function loadMaterials() {
    const response = await fetch('../compound/standard.json');
    const data = await response.json();
    if (!data.material || !Array.isArray(data.material)) {
        console.error('Loaded data does not contain a valid "material" array:', data);
        return [];
    }
    materials = data["material"]
}
function preloadImages() {
    let imageNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 53];

    imageNumbers.forEach(num => {
        let img = new Image();
        img.src = `../image/${num}.webp`;
        imageCache[num] = img;
    });
}


function drawRandomElements(elementsArray, count) {
    const selectedElements = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * elementsArray.length);
        selectedElements.push(elementsArray[randomIndex]);
    }
    return selectedElements;
}
function displayHand(hand, handDivId) {
    const handDiv = document.getElementById(handDivId);
    handDiv.innerHTML = '';
    hand.forEach((element) => {
        const card = document.createElement('div');
        const img = document.createElement('img');
        img.src = imageCache[elementToNumber[element]].src;
        img.alt = `Element ${element}`;
        card.appendChild(img);
        card.style.display = 'inline-block';
        card.style.border = '1px solid black';
        card.style.padding = '5px';
        card.className = 'card';

        // プレイヤーのターンのときのみ選択できる
        if (handDivId === 'hand' && isPlayerTurn) {
            card.addEventListener('click', function () {
                this.classList.toggle('selected');
                if (this.classList.contains('selected')) {
                    selectedElements[element] = (selectedElements[element] || 0) + 1;
                    this.style.border = '5px solid red';
                    this.style.padding = '1px';
                } else {
                    this.style.border = '1px solid black';
                    this.style.padding = '5px';
                    if (selectedElements[element]) {
                        selectedElements[element]--;
                        if (selectedElements[element] === 0) {
                            delete selectedElements[element];
                        }
                    }
                }
            });
        }

        handDiv.appendChild(card);
    });
}
async function findMaterials(components) {
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
    });
}
function disableButtons(disable) {
    document.getElementById('exchangeButton').disabled = disable;
    document.getElementById('searchButton').disabled = disable;
}
function updatePoints(compound, pointsDiv) {
    aiPoints += compound.point;
    pointsDiv.textContent = `AIポイント: ${aiPoints}`;
    checkWinCondition(); // 勝利条件を確認
}
function replaceUsedCards(compound, hand, isAI = false) {
    for (let element in compound.components) {
        for (let i = 0; i < compound.components[element]; i++) {
            const index = hand.indexOf(element);
            if (index > -1) {
                hand[index] = drawRandomElements(elements, 1)[0];
            }
        }
    }
    if (!isAI) {
        selectedElements = {};
    }
    displayHand(hand, isAI ? 'aiHand' : 'hand');
}

//AIの行動
async function aiTurn() {
    isPlayerTurn = false; // AIのターン開始
    clearAISelection();
    disableButtons(true);

    const possibleCompounds = await listCreatableMaterials(aiHand);
    const aiPointsDiv = document.getElementById('aiPoints');
    const resultDiv = document.getElementById('results');

    const compound = decideCompound(aiHand, possibleCompounds);
    if (compound) {
        console.log('AIが選択するはずのカード:', compound.components);
        for (let element in compound.components) {
            let count = compound.components[element];
            const elements = document.querySelectorAll(`#aiHand img[alt="Element ${element}"]`);
            for (let i = 0; i < elements.length && count > 0; i++) {
                const cardElement = elements[i].parentNode;
                cardElement.classList.add('selected');
                cardElement.style.border = '5px solid red';
                cardElement.style.padding = '1px';
                count--;
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        resultDiv.innerHTML = `<p>AIが生成: ${compound.name} (${compound.formula}) - ${compound.point} ポイント</p>`;
        updatePoints(compound, aiPointsDiv);
        replaceUsedCards(compound, aiHand, true);
    } else {
        const elementToExchange = decideElementsToExchange(aiHand);
        if (elementToExchange) {
            const cardElement = document.querySelector(`#aiHand img[alt="Element ${elementToExchange}"]`).parentNode;
            cardElement.classList.add('selected');
            cardElement.style.border = '5px solid red';
            cardElement.style.padding = '1px';
            await new Promise(resolve => setTimeout(resolve, 300));
            const index = aiHand.indexOf(elementToExchange);
            if (index > -1) {
                aiHand[index] = drawRandomElements(elements, 1)[0];
                displayHand(aiHand, 'aiHand');
            }
        }
    }

    disableButtons(false);
    isPlayerTurn = true; // プレイヤーのターンに戻す
    console.log('現在のプレイヤーの手札:', playerHand);
}

async function listCreatableMaterials(hand) {
    const materials = [];
    const combinations = getCombinations(hand);

    for (const combo of combinations) {
        const comboCounts = {};
        combo.forEach(el => comboCounts[el] = (comboCounts[el] || 0) + 1);
        const foundMaterials = await findMaterials(comboCounts);
        materials.push(...foundMaterials);
    }

    return materials;
}
function getCombinations(hand) {
    const results = [];

    const recurse = (path, hand, depth) => {
        if (depth === 0) {
            results.push(path);
            return;
        }
        for (let i = 0; i < hand.length; i++) {
            recurse(path.concat(hand[i]), hand.slice(i + 1), depth - 1);
        }
    };

    for (let i = 1; i <= hand.length; i++) {
        recurse([], hand, i);
    }

    return results;
}
function canGenerateCompound(hand, compound) {
    const availableElements = {};
    hand.forEach(el => availableElements[el] = (availableElements[el] || 0) + 1);

    for (let el in compound.components) {
        if (!availableElements[el] || availableElements[el] < compound.components[el]) {
            return false;
        }
    }
    return true;
}
function decideCompound(currentHand, possibleCompounds) {
    let bestCompound = null;
    let maxPoints = 0;
    for (let compound of possibleCompounds) {
        if (canGenerateCompound(currentHand, compound) && compound.point > maxPoints) {
            bestCompound = compound;
            maxPoints = compound.point;
        }
    }
    return bestCompound;
}
function decideElementsToExchange(currentHand) {
    const elementCounts = {};
    currentHand.forEach(el => elementCounts[el] = (elementCounts[el] || 0) + 1);

    let minCount = Infinity;
    let elementToExchange = null;
    for (let el in elementCounts) {
        if (elementCounts[el] < minCount) {
            minCount = elementCounts[el];
            elementToExchange = el;
        }
    }
    return elementToExchange;
}
function clearAISelection() {
    const aiCards = document.querySelectorAll('#aiHand .selected');
    aiCards.forEach(card => {
        card.classList.remove('selected');
        card.style.padding = "5px";
        card.style.border = "1px solid black"
    });
}



document.getElementById('exchangeButton').addEventListener('click', () => {
    let selectedCards = document.querySelectorAll('#hand .selected img');
    selectedCards.forEach(card => {
        let element = card.alt.split(' ')[1];
        let index = playerHand.indexOf(element);
        if (index > -1) {
            let newElement = elements[Math.floor(Math.random() * elements.length)];
            let elementNumber = elementToNumber[newElement];
            playerHand[index] = newElement;
            card.src = imageCache[elementNumber].src;
            card.alt = `Element ${newElement}`;
        }
        card.parentNode.classList.remove('selected');
        card.style.border = '1px solid black';
        card.style.padding = '5px';
    });
    selectedElements = {};
    displayHand(playerHand, 'hand');
    aiTurn();
});
document.getElementById('searchButton').addEventListener('click', async () => {
    const foundMaterials = await findMaterials(selectedElements);
    const resultDiv = document.getElementById('results');
    const pointsDiv = document.getElementById('points');
    resultDiv.innerHTML = '';

    if (foundMaterials.length > 0) {
        foundMaterials.forEach(material => {
            resultDiv.innerHTML += `<p>${material.name} (${material.formula}) - ${material.point} ポイント</p>`;
            playerPoints += material.point;
            replaceUsedCards(material, playerHand);
        });
        pointsDiv.textContent = `ポイント： ${playerPoints}`;
        checkWinCondition(); // 勝利条件を確認
    } else {
        resultDiv.innerHTML = '<p>該当する物質が見つかりませんでした。</p>';
    }
    
    aiTurn();
});
function checkWinCondition() {
    if (playerPoints>250 || aiPoints>250) {} else {return}
}
function initializeHands() {
    isPlayerTurn = true; // プレイヤーのターンをリセット
    aiHand = drawRandomElements(elements, 8);
    playerHand = drawRandomElements(elements, 8);
    displayHand(aiHand, 'aiHand');
    displayHand(playerHand, 'hand');
}

document.getElementById('startButton').addEventListener('click', () => {
    initializeHands();
    selectedElements = {};
    currentHand = drawRandomElements(elements, 8);
    displayHand(currentHand, 'hand');
    aiHand = drawRandomElements(elements, 8);
    displayHand(aiHand, 'aiHand');
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('exchangeButton').style.display = 'inline-block';
    document.getElementById('searchButton').style.display = 'inline-block';
});
document.addEventListener("DOMContentLoaded", function() {
    preloadImages();
    loadMaterials();
})