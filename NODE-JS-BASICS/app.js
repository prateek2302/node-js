// console.log('Hello World');
// console.log('This is my first Node.js application');
//CORE MODULES 
const readline = require('readline');
const fs = require('fs');
const http = require('http');
const url = require('url');
const events = require('events');


//USER DEFINED MODULES 
const replaceHtml = require('./Modules/replaceHtml').default;
const user = require('./Modules/user');

// THIRD PARTY MODULES / LIBRARIES
// const rl =readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question('What is your name? ', (answer) => {
//   console.log(`Hello ${answer}`);
//   rl.close();
// });

// rl.on('close', () => {
//   console.log('Goodbye!');
//   process.exit(0);
// });

// let textIn = fs.readFileSync('input.txt', 'utf8');
// console.log(textIn);

// let content = `Data read from input.txt: ${textIn} \n Date created: ${new Date().toLocaleString()}`
// fs.writeFileSync('output.txt', content);


// fs.readFile('./Files/start.txt', 'utf8', (err, data) => {
//   if (err) throw err;
//     console.log(data);
//     fs.readFile('./Files/input.txt', 'utf8', (err, data1) => {
//      if (err) throw err;
//      console.log(data1);
//         fs.readFile('./Files/append.txt', 'utf8', (err, data2) => {
//          if (err) throw err;
//          console.log(data2);
//             fs.writeFile('./Files/output.txt', `${data1}\n${data2}\n\nDate Created: ${new Date().toLocaleString()}`, (err) => {
//                 if (err) throw err;
//                 console.log('Data has been written to output.txt');
//       });
//     });
//   });
// });

const html = fs.readFileSync('./Template/index.html', 'utf8')
let products = JSON.parse(fs.readFileSync('./Data/products.json', 'utf8'))
let productListHtml = fs.readFileSync('./Template/product-list.html', 'utf8');
let productDetailHtml = fs.readFileSync('./Template/product-details.html', 'utf8');


// function replaceHtml(template, product) {
//      let output = template.replace('{{%IMAGE%}}', product.productImage);
//         output = output.replace('{{%NAME%}}', product.name);
//         output = output.replace('{{%MODELNAME%}}', product.modelName);
//         output = output.replace('{{%MODELNO%}}', product.modelNumber);
//         output = output.replace('{{%SIZE%}}', product.size);
//         output = output.replace('{{%CAMERA%}}', product.camera);
//         output = output.replace('{{%PRICE%}}', product.price);
//         output = output.replace('{{%COLOR%}}', product.color);
//         output = output.replace('{{%ID%}}', product.id);
//         output = output.replace('{{%ROM%}}', product.rom);
//         output = output.replace('{{%DESC%}}', product.Description);
//     return output;
// }

// CREATE SERVER
// const server = http.createServer((req, res) => {
//     let { query, pathname: path } = url.parse(req.url, true);
//     // console.log(query);
//     // let path = req.url;

//     if (path === '/' || path.toLocaleLowerCase() === '/home') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in Home page'));
//     } else if (path.toLocaleLowerCase() === '/about') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in About page'));
//     } else if (path.toLocaleLowerCase() === '/contact') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in Contact page'));
//     } else if (path.toLocaleLowerCase() === '/products') {
//         if (!query.id) {
//             let productHtmlArray = products.map((prod) => {
//                 return replaceHtml(productListHtml, prod);
//             });
//             let productResponseHtml = html.replace('{{%CONTENT%}}', productHtmlArray.join(','));
//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.end(productResponseHtml);
//         } else {
//             let prod = products[query.id];
//             let productDetailResponseHtml = replaceHtml(productDetailsHtml, prod);
//             res.end(html.replace('{{%CONTENT%}}', productDetailResponseHtml));
//         }
//     } else {
//         res.writeHead(404, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', '404: Page Not Found'));
//     }
// });


const server = http.createServer();

// server.on('request', (req, res) => {
//     let { query, pathname: path } = url.parse(req.url, true);
//     // console.log(query);
    // let path = req.url; 

//     if (path === '/' || path.toLocaleLowerCase() === '/home') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in Home page'));
//     } else if (path.toLocaleLowerCase() === '/about') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in About page'));
//     } else if (path.toLocaleLowerCase() === '/contact') {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', 'You are in Contact page'));
//     } else if (path.toLocaleLowerCase() === '/products') {
//         if (!query.id) {
//             let productHtmlArray = products.map((prod) => {
//                 return replaceHtml(productListHtml, prod);
//             });
//             let productResponseHtml = html.replace('{{%CONTENT%}}', productHtmlArray.join(','));
//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.end(productResponseHtml);
//         } else {
//             let prod = products[query.id]
//             let productDetailResponseHtml = replaceHtml(productDetailHtml, prod);
//             res.end(html.replace('{{%CONTENT%}}', productDetailResponseHtml));
//         }
//     } else {
//         res.writeHead(404, { 'Content-Type': 'text/html', 'my-custom-header': 'Hello World' });
//         res.end(html.replace('{{%CONTENT%}}', '404: Page Not Found'));
//     }
// });
// START SERVER
server.listen(8000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:8000/');
});

// let myEmitter = new user();

// myEmitter.on('userCreated', (id, name) => {
//     console.log(`A new user ${name} with ID ${id} is created.`);
// });


// myEmitter.on('userCreated', (id, name) => {
//     console.log(`A new user ${name} with ID ${id} is added in database!`);
// });

// myEmitter.emit('userCreated', 1, 'John Doe');


// SOLUTION 1: without readable and writable stream
// server.on('request', (req, res) => {
//     fs.readFile('./Files/large-file.txt', 'utf8', (err, data) => {
//         if (err) {
//             res.end('Error reading file');
//             return;
//         }
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end(data);
//     });
// });

// SOLUTION 2: USING READABLE AND WRITABLE STREAM 
// server.on('request', (req, res) => {
//    let rs = fs.createReadStream('./Files/large-file.txt', 'utf8');  

//    rs.on('data', (chunk) => {
//        res.write(chunk);
//    });
//    rs.on('end', () => {
//        res.end();
//    });
//    rs.on('error', (err) => {
//        res.end(err.message);
//    });
// });

// SOLUTION 3: USING PIPE
// server.on('request', (req, res) => {
//    let rs = fs.createReadStream('./Files/large-file.txt', 'utf8');
//    rs.pipe(res);
//    //readableSource.pipe(writableDestination);
// });

console.log('Program has started');


//stored --- 2nd phase  
fs.readFile('./Files/input.txt', 'utf8', () => {
    console.log('File read callback executed');
    // stored in 1st phase 
    setTimeout(() => {
    console.log('Timeout callback executed');
}, 0);

    //stored in 3rd phase   
    setImmediate(() => {console.log('Immediate callback executed');

    process.nextTick(() => {
        console.log('Next tick callback executed');
    });
});

}); 


console.log('Program has completed');