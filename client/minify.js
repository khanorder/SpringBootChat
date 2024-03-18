import fs from 'fs';
import path from 'path';
import uglyfyjs from 'uglify-js';

const sep = path.sep == "\\" ? "\\\\" : path.sep;
const distPath = path.join(process.cwd(), 'dist');
const minifyPatterns = [
    new RegExp(/.*dist\\server.*\.js/g),
    new RegExp(/.*dist\\\.next\\server.*\.js/g),
]

let succeedCount = 0;

function main() {
    if (false == fs.existsSync(distPath)) {
        console.error(`Not Found the dist directory.`);
        return false;
    }

    const distDir = fs.readdirSync(distPath);
    if (1 > distDir.length) {
        console.error(`The dist directory is empty.`);
        return false;
    }


    for (let i = 0; i < distDir.length; i++) {
        minify(distDir[i]);
    }
    console.log(`${succeedCount} files minified.`);
}

function minify(target) {
    const targetPath = path.join(process.cwd(), 'dist', target);

    if (fs.lstatSync(targetPath).isDirectory()) {
        const targetDir = fs.readdirSync(targetPath);

        if (1 > targetDir.length) {
            failedCount++;
            return false;
        }

        for (let i = 0; i < targetDir.length; i++) {
            minify(`${target}/${targetDir[i]}`);
        }
    } else if (targetPath.endsWith('.js')) {
        if (1 > minifyPatterns.length) {
            console.error(`Not Found any patterns.`);
            return false;
        }

        for (let i = 0; i < minifyPatterns.length; i++) {
            const pattern = minifyPatterns[i];

            if (targetPath.match(pattern)) {
                // console.error(targetPath);
                fs.writeFileSync(targetPath, uglyfyjs.minify(fs.readFileSync(targetPath, 'utf8'), { toplevel: true }).code);
                succeedCount++;
                return true;
            }
        }
    }

    return false;
}

main();