/*
 * sha256 非同期関数
 * 入力:
 *   str: 文字列
 * 出力:
 *   文字列としての16進数
 * 処理:
 *   入力された文字列を sha256 の アルゴリズムでハッシュ化する
 *   参考サイト: https://scrapbox.io/nwtgck/SHA256%E3%81%AE%E3%83%8F%E3%83%83%E3%82%B7%E3%83%A5%E3%82%92JavaScript%E3%81%AEWeb%E6%A8%99%E6%BA%96%E3%81%AE%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%81%A0%E3%81%91%E3%81%A7%E8%A8%88%E7%AE%97%E3%81%99%E3%82%8B
 */
async function sha256(str) {
    // 1. 入力された文字列を uint8Array経由で ArrayBuffer にする
    //    (モジュールが受け取れる形式が ArrayBuffer である)
    const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;

    // 2. sha256 でハッシュ化したものを ArrayBufferとして得る
    const digest = await crypto.subtle.digest('SHA-256', buff);

    // 3. 上記 ArrayBuffer を 16進文字列に変換する
    return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/*
 * AES256_encrypt 非同期関数
 * 入力:
 *   message: Uint8Array
 *   password: 文字列
 * 出力:
 *   文字列としての16進数
 * 処理:
 *   messageを、passwordを暗号鍵として AES256 で暗号化する。
 *   参考サイト: https://developer.so-tech.co.jp/entry/2023/03/06/121918
 */
async function AES256_encrypt(message, password) {
    // 1. パスワードをTypedArrayに
    const pwd = new TextEncoder().encode(password);

    // 2. 鍵を求める
    const salt = new Uint8Array(16); 
    // ソルトを導入する場合は const salt = window.crypto.getRandomValues(new Uint8Array(16)); とする
    const key = await deriveKey(pwd, salt);
    const iv = new Uint8Array(12);
    // 初期化ベクトルを導入する場合は const iv = window.crypto.getRandomValues(new Uint8Array(12)); とする

    // 3. 暗号化を実行
    const cipher = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128,  // GCMモードの改ざんチェック用データの長さ
            additionalData: new TextEncoder().encode('test') // GCMモードのAAD（追加認証データ）、無くても良い
        },
        key,
        message
    );

    return buf2hex(cipher);

    /* // IV, salt, 暗号文を出力とする場合
    return {
        iv,
        salt,
        cipher
    }*/
}

/*
 * AES256_decrypt 非同期関数
 * 入力:
 *   cipher: 文字列としての16進数
 *   password: 文字列
 *   iv: 初期化ベクトル (デフォルト値は  new Uint8Array(12) )
 *   salt: ソルト値 (デフォルト値は  new Uint8Array(16) )
 * 出力:
 *   Uint8Array
 * 処理:
 *   cipherを、passwordを暗号鍵として AES256 で復号する。
 *   参考サイト: https://developer.so-tech.co.jp/entry/2023/03/06/121918
 */
async function AES256_decrypt(cipher, password, iv = new Uint8Array(12), salt = new Uint8Array(16)) {
    // 1. パスワードをTypedArrayに
    const pwd = new TextEncoder().encode(password);

    // 2. 鍵を求める
    const key = await deriveKey(pwd, salt);

    // 3. 復号を実行
    const buffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128,
            additionalData: new TextEncoder().encode('test')
        },
        key,
        hex2buf(cipher)
    );

    return new Uint8Array(buffer);
}

async function deriveKey(password, salt) {
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        password,
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 2000,
            hash: "SHA-256",
        },
        passwordKey,
        {
            name: "AES-GCM",
           length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}
function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map(
        x => x.toString(16).padStart(2, '0')
    ).join('');
}
function hex2buf(hex){
    // https://stackoverflow.com/questions/43131242/how-to-convert-a-hexadecimal-string-of-data-to-an-arraybuffer-in-javascript
    return (new Uint8Array(hex.match(/[\da-f]{2}/gi).map( h => parseInt(h, 16)))).buffer;
}

function hex2base64(hex){
    //return btoa(String.fromCharCode.apply(null, new Uint8Array(hex.match(/.{1,2}/g).map(v => parseInt(v, 16)))));
    return btoa(hex.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}


function base64_to_hex(base64){
    const raw = atob(base64);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16);
        result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase().toLowerCase();
}








function predict_mime(){}