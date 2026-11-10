import fs from 'node:fs/promises';
import * as board from './board.js';

const DATA_FOLDER = './data';

let dataFile = 'data.json';

const dataString = await fs.readFile(DATA_FOLDER + '/' + dataFile, 'utf8');

const posts = JSON.parse(dataString);

for(let post of posts){
    board.addPost(post);
}

console.log('Demo data loaded');