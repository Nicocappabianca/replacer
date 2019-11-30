const fs = require('fs'),
path = require('path')


String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
};

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
            if (stat && stat.isDirectory()) {
                walk(file, function(err, res) {
                    results = results.concat(res);
                    next();
                });
            } else {
                results.push(file);
                next();
            }
        });
        })();
    });
};

function is_an_ignored_file(filename, ignore_array) {
    for (let i = 0; i < ignore_array.length; i++) {
        const element = ignore_array[i];
        if(filename.includes(element)){
            return true; 
        }
    }
    return false; 
}

function search_and_replace(arr, buf) {
    var replaced = buf.toString();
    for (let i = 0; i < arr.length; i++) {

        const search = arr[i][0];
        const replace = arr[i][1];

        replaced = replaced.replaceAll(search, replace);        
    } 
    return replaced;    
}

function is_something_wrong(replaced_str, checks) {
    for (let i = 0; i < checks.length; i++) {
        const element = checks[i];
        
        if(replaced_str.includes(element)){
            return true; 
        }
    }
    return false; 
}

function main() {
    const homedir = require('os').homedir();
    const knuth_dir = path.join(homedir, 'Desktop', 'Dev', 'k-nuth');
    const readme_file = path.join(knuth_dir, 'kth-database', 'README.md');

    const words = [
                    ["/bitprim/bitprim", "/k-nuth/kth"],
                    ["2017-2018 Bitprim Inc.", "2016-2019 Knuth Project."],
                    ["This file is part of Bitprim.", "This file is part of Knuth Project."], 
                    ["conan remote add bitprim", "conan remote add kth"],  
                    ["conan remote remove bitprim", "conan remote remove kth"], 
                    ["0.X@bitprim", "0.X@kth"], 
                    ["BITPRIM_", "KNUTH_"], 
                    ["BitprimConanFile", "KnuthConanFile"], 
                    ["@bitprim/", "@kth/"], 
                    ["Note(bitprim):", "Note(knuth):"], 
                    ["<bitprim/", "<knuth/"], 
                    ["BC_CONSTEXPR", "constexpr"],
                    ["bitprim_temp", "kth_temp "],
                    ["bitprim-", "kth-"],
                    ["Bitprim branch:", "Knuth branch:"], 
                    ["*Bitprim*", "*Knuth*"], 
                    ["bitprim::","knuth::"], 
                    
    ];        
    
    const checks = ['bitprim'];
    const ignore = ['.git'];

    walk(knuth_dir, function(err, files) {
        if (err) throw err;

        for (let i = 0; i < words.length; i++) {
            const w = words[i];

            
            for (let i = 0; i < files.length; i++) {
                const filename = files[i];
                
                if ( ! is_an_ignored_file(filename, ignore)){ 
                    fs.readFile(filename, function(e,d) {
                        if (!e) {
                            //var reemplazo_unico = [[w[1], w[1]]];
                            var replaced_str = search_and_replace(words, d); 
                            fs.writeFile(filename, replaced_str, function(err) {
                                if (err) console.log(err);
                            });

                            if (is_something_wrong(replaced_str, checks)){
                                console.log(filename); 
                            }

                            } else {
                            console.log(e);
                            }
                    });
                }
            }  
        }
    });    
}

main(); 
