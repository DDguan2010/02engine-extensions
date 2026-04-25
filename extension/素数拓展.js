// 扩展：Hello_Prime
// 素不相识-素数相关返回值拓展
// Version 5  date_2026.4.25

/* 拓展积木清单一览：

    布尔型积木（BOOLEAN）
        01 [ ] 是素数
        02 [ ] 是合数
        03 [ ] 是回文
        04 [ ] 是回文素数
        05 [ ] 是梅森素数
        06 [ ] 是安全素数
        07 [ ] 与 [ ] 互质
        08 [ ] 与 [ ] 互为孪生素数
        09 [ ] 是以 [ ] 为底的强伪素数

    报告型积木（REPORTER）
        01 [ ] 的第 [ ] 个结果
        02 [ ] 的结果数
        03 随机生成 [ ] 位素数
        04 [ ] 的孪生素数
        05 离 [ ] 最近的素数
        06 整数 [ ] 约数总数
        07 整数 [ ] 的 [ 所有 / 正 / 负 ] 约数
        08 离 [ ] 最近的回文素数
        09 整数 [ ] 的欧拉函数值
        10 整数 [ ] 的莫比乌斯函数值
        11 整数 [ ] 及以内的素数个数
        12 整数 [ ] 及以内的最大素数
        13 整数 [ ]~[ ] 及以内的全部素数
        14 哥德巴赫 [ 快速拆解 / 均匀拆解 / 随机拆解 ] 偶数 [ ] 为素数
        15 [ ]~[ ] 的 [ 开区间 / 闭区间 / 左开右闭区间 / 左闭右开区间 ] 范围内的素数个数
        16 [ ]~[ ] 的 [ 开区间 / 闭区间 / 左开右闭区间 / 左闭右开区间 ] 范围内的最大素数
        17 结果的分隔符

    命令型积木（COMMAND）
        01 设置结果的分隔符为 [ ]
        
*/
let separator = ",";
function eulerSieve(max) {
    if (Math.abs(max - Math.floor(max)) > 0) return "";
    max=Math.floor(max);
    if (max < 2) return { isPrime: new Array(max + 1).fill(false) };
    let isPrime = new Array(max + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    let primes = [];
    for (let i = 2; i <= max; i++) {
        if (isPrime[i]) primes.push(i);
        for (let p of primes) {
            if (i * p > max) break;
            isPrime[i * p] = false;
            if (i % p === 0) break;
        }
    }
    return { isPrime };
}
function is_PRIME(n) {
    n = Number(n);
    if (typeof n !== 'number') return false;//  不是数字类型 → 拒绝
    if (!isFinite(n)) return false;
    if (Math.abs(n - Math.floor(n)) > 0) return false;
    n = Math.floor(n);
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0) return false;

    let d = n - 1;// 把 n-1 写成 d * 2^s
    let s = 0;
    while (d % 2 === 0) {d /= 2;s++;}
    const bases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];// 确定性底数（可正确验证所有 < 2^64 的整数）
    for (let a of bases) {
        if (a >= n) continue;
        let x = powMod(a, d, n);
        if (x === 1 || x === n - 1) continue;
        let composite = true;
        for (let r = 1; r < s; r++) {
            x = powMod(x, 2, n);
            if (x === n - 1) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
}
function gcd(a, b) {
  a = Math.abs(a);b = Math.abs(b);
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
function isCoprime(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') return "";
  if (!isFinite(a) || !isFinite(b)) return "";
  if (!Number.isInteger(a) || !Number.isInteger(b)) return "";
  if (a === 0 && b === 0) return "";
  return gcd(a, b) === 1;
}
function isPalindrome(n) {
    let str = String(n);  
    if(str==="") return false;
    let rev = str.split('').reverse().join('');
    return str === rev;
}
function nearestPalPrime(num) {
    if (num <= 2) return "2";
    if (is_PRIME(num) && isPalindrome(num)) {return String(num);}
    let distance = 1;
    while (true) {
        let left = num - distance;
        let right = num + distance;
        let leftOk = left >= 2 && is_PRIME(left) && isPalindrome(left);
        let rightOk = is_PRIME(right) && isPalindrome(right);
        if (leftOk && rightOk) {return left + separator + right;}
        if (leftOk) {return String(left);}
        if (rightOk) {return String(right);}
        distance++;
    }
}
function is_PAL2(num) {
        if (num < 2) return "";
        if (!is_PRIME(num))return "";
        let n1 = num - 2;
        let leftIsPrime = is_PRIME(n1);
        let n2 = num + 2;
        let rightIsPrime = is_PRIME(n2);
        if (rightIsPrime&&leftIsPrime) return `${n1}${separator}${n2}`;
        else {
        if (leftIsPrime) {return n1;} 
        else {
        if (rightIsPrime) {return n2;} 
        else {return "";}
        }
    }
}
function nearestPrime(num) {
    if (num <= 2) return 2;
    if (is_PRIME(num)) return num ; 
    let distance = 1;
    while (true) {
        let left = num - distance;
        let right = num + distance;
        let leftOk = left >= 2 && is_PRIME(left);   
        let rightOk = is_PRIME(right);  
        if (leftOk && rightOk) return `${left}${separator}${right}`;
        if (leftOk) { return left ;}
        if (rightOk) { return right ; }
        distance++;
    }
}
function eulerTotient(n) {
    n = Number(n);
    if (typeof n !== 'number') return "";//  不是数字类型 → 拒绝
    if (!isFinite(n)) return "";// 是 NaN 或 Infinity → 拒绝

    if (Math.abs(n - Math.floor(n)) > 0) return "";
    n = Math.floor(n);
    if (n <= 0) return "";//  非正数 → 拒绝
    if (n === 1) return 1;
    let result = n;
    let temp = n; 
    // φ(n) = n * ∏(1 - 1/p)
    // 遍历从 2 到 sqrt(temp) 的所有可能因子
    for (let i = 2; i * i <= temp; i++) {
        if (temp % i === 0) {// 如果 i 是 temp 的一个质因子
            result = result / i * (i - 1);// 应用公式：result = result / i * (i - 1)
            while (temp % i === 0) {temp /= i;// 彻底除以 i，确保只处理不同的质因子
            }
        }
    }
    // 处理剩余的大于 1 的质因子
    // 如果循环结束后 temp 仍然大于 1，说明它本身是一个质数
    if (temp > 1) {result = result / temp * (temp - 1);}
    return result;
}
function countDivisors(n) {
    if (typeof n !== 'number') return "";
    if (!isFinite(n)) return "";
    if (!Number.isInteger(n)) return "";
    if (n <= 0) return "";
    if (n === 1) return 1;
    let res = 1;
    let temp = n;
    for (let i = 2; i * i <= temp; i++) {// 质因数分解 + 套公式
        if (temp % i === 0) {
            let cnt = 0;
            while (temp % i === 0) {// 统计这个质因子的指数
                cnt++;
                temp /= i;
            }
            res *= cnt + 1;// 公式：指数 + 1 再相乘
        }
    }
    if (temp > 1) res *= 2;
    return res*2;
}
function getAllDivisors(n) {
    if (typeof n !== 'number') return "";
    if (!isFinite(n)) return "";
    if (!Number.isInteger(n)) return "";
    if (n === 0) return "";
    let absN = Math.abs(n);

    let divisors = [];
    for (let i = 1; i * i <= absN; i++) {
        if (absN % i === 0) {
            divisors.push(i);           // 正约数
            divisors.push(-i);          // 负约数（只加这一行就够了）
            if (i !== absN / i) {
                divisors.push(absN / i);
                divisors.push(-(absN / i));
            }
        }
    }

    divisors.sort((a, b) => a - b);
    return divisors.join(separator);
}
function randomPrime(args) {
      const n = Math.floor(Number(args));
      if (n < 1 ||!isFinite(n)) return "非法的位数";// 是 NaN 或 Infinity → 拒绝
      if (n > 16) return "位数超出范围"; // 限制1-15位，避免过大数据卡死

      const min = 10 ** (n - 1);
      const max = (10 ** n) - 1;

      // 循环生成，直到找到素数
      while (true) {
        // 生成奇数（偶数除了2都不是素数）
        let candidate = Math.floor(Math.random() * (max - min + 1)) + min;
        if (candidate % 2 === 0) candidate++;
        if (candidate > max) candidate -= 2;// 边界处理：如果生成的数超过max，减2

        if (is_PRIME(candidate)) {return candidate; }
      }
}  
function mobius(n) {
    n = Number(n);
    if (typeof n !== 'number') return "";//  不是数字类型 → 拒绝
    if (!isFinite(n)) return "";// 是 NaN 或 Infinity → 拒绝
    if (Math.abs(n - Math.floor(n)) > 0) return "";//不是整数，拒绝
    n = Math.floor(n);
    if (n <= 0) return "";//  非正数 → 拒绝
    if (n === 1) return 1;
  let primeCount = 0;// 分解质因数，同时判断是否有平方因子
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      let exponent = 0;
      while (n % p === 0) {
        exponent++;
        n /= p;
      }
      if (exponent >= 2) return 0;// 有平方因子
      primeCount++;
    }
  }
  if (n > 1) primeCount++;// 剩下一个大质数
  return primeCount % 2 === 0 ? 1 : -1;// 偶数个返回1，奇数个返回-1
}
function powMod(base, exp, mod) {
        let result = 1n;
        base = BigInt(base);
        exp = BigInt(exp);
        mod = BigInt(mod);
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) {
                result = (result * base) % mod;
            }
            base = (base * base) % mod;
            exp = exp / 2n;
        }
        return Number(result);
};
function isStrongPseudoprime(a, b) {
    a = Number(a);
    b = Number(b);
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    if (!isFinite(a) || !isFinite(b)) return false;
    if (a < 3 || b < 2 || b >= a) return false;

    if (Math.abs(a - Math.floor(a)) > 0) return false;
    if (Math.abs(b - Math.floor(b)) > 0) return false;
    a = Math.floor(a);
    b = Math.floor(b);
    if (is_PRIME(a)) return false;
    // 开始 Miller-Rabin 单次测试
    let d = a - 1;
    let s = 0;
    while (d % 2 === 0) {d /= 2; s++;}

    let x = powMod(b, d, a);
    if (x === 1 || x === a - 1) {return true;}

    for (let r = 1; r < s; r++) {
        x = powMod(x, 2, a);
        if (x === a - 1) {return true; }
    }
    return false;
}
class Hello_Prime{
    constructor(runtime) {
        this.runtime = runtime;
    }
    getInfo(){
        return{
            id:"HelloPrime20250421",
            name:"素数拓展V5",
            color1: "#753297",   // 主色：专业深紫
            color2: "#894c93",   // 辅色：浅一点的同色系
            blocks:[
                {
                    opcode:"is_PRIME",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]是素数",  
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"is_COMPOSITE",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]是合数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"is_PAL",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]是回文",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.STRING,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"is_PAL_PRIME",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]是回文素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"isMersenne",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[n]是梅森素数",
                    arguments:{
                        n:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode: "isSafePrime",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "[a]是安全素数",
                    arguments: {
                        a: { type: Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                         }
                    }
                },
                {
                    opcode:"is_comprime",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]与[b]互质",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"is_PAL_PRIME2",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]与[b]互为孪生素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"is_fake",
                    blockType:Scratch.BlockType.BOOLEAN,
                    text:"[a]是以[b]为底的强伪素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"get_result",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"[a]的第[b]个结果",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.STRING,
                            defaultValue:"Hello"+separator+"Primes",//示例
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER, 
                            defaultValue: 2,  
                        }
                    }
                },
                {
                    opcode:"get_resultnum",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"[a]的结果数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.STRING,
                            defaultValue:"2"+separator+"3"+separator+"5"+separator+"7"+separator+"11",
                        },
                    }
                },
                {
                opcode: 'randomPrime',
                blockType: Scratch.BlockType.REPORTER,
                text: '随机生成 [n] 位素数',
                arguments: {
                    n: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: Math.floor(Math.random() * 10) + 3,
                        }
                    }
                },
                {
                    opcode:"is_PAL2",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"[a]的孪生素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"nearest_prime",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"离[a]最近的素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"count_div",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数[a]约数总数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"all_div",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数[a]的[b]约数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.STRING,
                            menu:"PAT",
                            defaultValue:"正",
                        }
                    }
                },
                {
                    opcode:"nearest_pal_prime",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"离[a]最近的回文素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"euler",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数[a]的欧拉函数值",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"mobiu",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数[a]的莫比乌斯函数值",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"count_primes",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数 [num] 及以内的素数个数",
                    arguments:{
                        num:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"max_primes",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数 [num] 及以内的最大素数",
                    arguments:{
                        num:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        }
                    }
                },
                {
                    opcode:"is_PAL4_1",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"整数[a]~[b]及以内的全部素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                    }
                },
                {
                    opcode:"is_PAL3",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"哥德巴赫[op]偶数[a]为素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        op:{
                            type:Scratch.ArgumentType.STRING,
                            menu:"PAL3",
                            defaultValue:"快速拆解",
                        }
                    }
                },
                {
                    opcode:"is_PAL4",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"[a]~[b]的[edge]范围内的素数个数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        edge:{
                            type:Scratch.ArgumentType.STRING,
                            menu:"PAL4",
                            defaultValue:"闭区间",
                        }
                    }
                },
                {
                    opcode:"is_PAL4_2",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"[a]~[b]的[edge]范围内的最大素数",
                    arguments:{
                        a:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        b:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:"",
                        },
                        edge:{
                            type:Scratch.ArgumentType.STRING,
                            menu:"PAL4",
                            defaultValue:"闭区间",
                        }
                    }
                },
                {
                    opcode:"seprator",
                    blockType:Scratch.BlockType.REPORTER,
                    text:"结果的分隔符",
                },
                {
                    opcode:"set_seprator",
                    blockType:Scratch.BlockType.COMMAND,
                    text:"设置结果的分隔符为[s]",
                    arguments:{
                        s:{
                            type:Scratch.ArgumentType.STRING,
                            defaultValue:separator,
                        }
                    }
                },
            ],
            
            menus:{PAL3:{items:["快速拆解","均匀拆解","随机拆解"]},
                  PAL4:{items:["开区间","闭区间","左开右闭区间","左闭右开区间"]},
                  PAT: { items: ["正", "负", "所有"] },
            }
        }
    }

    is_PRIME(args){return is_PRIME(args.a);}
    euler(args){return eulerTotient(args.a);}
    mobiu(args){return mobius(args.a);}
    count_div(args){return countDivisors(args.a);}
    all_div(args) {
    let all = getAllDivisors(args.a); // 先拿到所有约数字符串
        if (args.b === "所有")return all;
            let arr = all.split(separator);
        if (args.b === "正") {
            let positive = arr.filter(x => Number(x) > 0);
            return positive.join(separator);
        }
        if (args.b === "负") {
            let negative = arr.filter(x => Number(x) < 0);
            return negative.join(separator);
        }
    }
    is_fake(args){return isStrongPseudoprime(args.a,args.b);}
    is_comprime(args){return isCoprime(args.a,args.b);}
    is_PAL(args){return isPalindrome(args.a);}
    is_PAL_PRIME(args){return is_PRIME(args.a) && isPalindrome(args.a);}
    is_PAL_PRIME2(args){return is_PRIME(args.a) && is_PRIME(args.b)&&Math.abs(args.a-args.b)===2;}
    is_COMPOSITE(args){
        if (!isFinite(args.a)) return false;// 是 NaN 或 Infinity → 拒绝
        if(args.a<=1) return false;
        return !is_PRIME(args.a);
    }
    randomPrime(args){return randomPrime(args.n);}
    is_PAL2(args){return is_PAL2(args.a);}
    get_resultnum(args){
        if (args.a==="")return 0;
        let str = String(args.a);
        let arr = str.split(separator);
        return arr.length;
    }
    get_result(args){
        if (args.a==="")return "";
        let str = String(args.a);
        let arr = str.split(separator);
        let v = Math.abs(args.b) - Math.floor(Math.abs(args.b));
        if (v !== 0) return "";
        if(arr.length<args.b)return "";
        if (args.b<1)return"";
        else return arr[args.b-1];
    }
    nearest_prime(args){return nearestPrime(args.a);}
    nearest_pal_prime(args){return nearestPalPrime(args.a);}
    isMersenne(args) {
    const n = Number(args.n);
    if (typeof n !== 'number') return false;//  不是数字类型 → 拒绝
    if (!isFinite(n)) return false;// 是 NaN 或 Infinity → 拒绝
    let v = Math.abs(args.n) - Math.floor(Math.abs(args.n));
        if (v !== 0) return false;
    if (n <= 0) return false;//  非正数 → 拒绝
    if (n < 2) return false;
    const num = n + 1;
    // 判断是不是 2 的次方
    if ((num & (num - 1)) !== 0) return false;
    let p = 0;
    let temp = num;
    while (temp > 1) {temp /= 2; p++;}
    // 核心：p 必须是素数，n 必须是素数
    return is_PRIME(p) && is_PRIME(n);
}
isSafePrime(args) {
    const num = Number(args.a);
    // 安全素数规则：自己是素数 且 (num-1)/2 是素数
    return is_PRIME(num) && is_PRIME((num - 1) / 2);
}
is_PAL3(args) {
    const num = Number(args.a);
    if (typeof num !== 'number' || !isFinite(num)) return "";
    if (Math.abs(num - Math.floor(num)) > 0) return ""; 
    if (num < 4 || num % 2 !== 0) return "";
    if(num>2000000000000000)return "范围过大";

    if (args.op === "快速拆解") {
        if (is_PRIME(2) && is_PRIME(num - 2)) return "2" + separator + (num - 2);
        for (let a = 3; a <= num / 2; a += 2) { // 只循环奇数
            let b = num - a;
            if (is_PRIME(a) && is_PRIME(b)) {
                return a + separator + b;
            }
        }
    }

    if (args.op === "均匀拆解") {
        let start = Math.floor(num / 2);
        if (start % 2 === 0) start--; // 从奇数开始
        for (let a = start; a >= 3; a -= 2) { // 只循环奇数
            let b = num - a;
            if (is_PRIME(a) && is_PRIME(b)) {
                return a + separator + b;
            }
        }
    }

    if (args.op === "随机拆解") {
        const half = num / 2;
        for (let i = 0; i < 500; i++) {
            // 直接生成奇数，少一步判断（提速）
            let a = 2 * Math.floor(Math.random() * (half / 2)) + 3;
            let b = num - a;
            if (is_PRIME(a) && is_PRIME(b)) {
                return a + separator + b;
            }
        }
        if (is_PRIME(2) && is_PRIME(num - 2)) return "2" + separator + (num - 2);
        for (let a = 3; a <= num / 2; a += 2) {
            let b = num - a;
            if (is_PRIME(a) && is_PRIME(b)) {
                return a + separator + b;
            }
        }
    }

    return "";
}
count_primes(args) {
    const num = Number(args.num);
    let count = 0;
    for (let i = 2; i <= num; i++) {
        if (is_PRIME(i)) {count++; }
    }
    return count; 
}
is_PAL4_1(args) {
    let L = Number(args.a);// 欧筛
    let R = Number(args.b);
    if (L > R) return "";
    if (!isFinite(L) || !isFinite(R)) return "";
    if (R < 2) return "";
    
    let { isPrime } = eulerSieve(R);
    let arr = [];
    for (let i = L; i <= R; i++) {
        if (i >= 2 && isPrime[i]) arr.push(i);
    }
    return arr.length === 0 ? "" : arr.join(separator);
}
is_PAL4(args) {
    let L = Number(args.a);
    let R = Number(args.b);
    if (L > R) return "";
    if (!isFinite(L) || !isFinite(R)) return "";
    if(R>100000000)return "范围过大";
    if (R < 2) return 0;

    let { isPrime } = eulerSieve(R);
    let count = 0;

    // 统一起始和结束范围，只循环一次
    let start, end;
    switch (args.edge) {
        case "闭区间": start = L; end = R; break;
        case "开区间": start = L + 1; end = R - 1; break;
        case "左开右闭区间": start = L + 1; end = R; break;
        case "左闭右开区间": start = L; end = R - 1; break;
        default: return 0;
    }
    // 边界修正
    start = Math.max(start, 2);
    if (start > end) return 0;
    // 只遍历有效区间
    for (let i = start; i <= end; i++) {if (isPrime[i]) count++;}
    return count;
}

is_PAL4_2(args) {
    let L = Number(args.a);
    let R = Number(args.b);
    if (L > R) return "";
    if (!isFinite(L) || !isFinite(R)) return "";
    if(R>100000000)return "范围过大";
    if (R < 2) return "";

    let { isPrime } = eulerSieve(R);
    let maxPrime = 0;

    let start, end;
    switch (args.edge) {
        case "闭区间": start = L; end = R; break;
        case "开区间": start = L + 1; end = R - 1; break;
        case "左开右闭区间": start = L + 1; end = R; break;
        case "左闭右开区间": start = L; end = R - 1; break;
        default: return "";
    }

    start = Math.max(start, 2);
    if (start > end) return "";

    // 倒序查找！找到第一个素数直接返回
    for (let i = end; i >= start; i--) {
        if (isPrime[i]) {
            maxPrime = i;
            break; 
        }
    }

    return maxPrime > 1 ? maxPrime : "";
}
max_primes(args) {
    if (!isFinite(args.num)) return "";
    const num = Math.floor(args.num);
    let count = 0;
    for (let i = 2; i <= num; i++) {
        if (i>count&&is_PRIME(i)) {
            count=i; 
        }
    }
    if (count>1){return count;}else{return "";} 
}
set_seprator(args) {
    let input = String(args.s); let NewS = input.charAt(0);
    if (NewS === "" || !isNaN(Number(NewS))) {separator = ",";} 
    else {separator = NewS;}
}
seprator(){return separator ;}
}
Scratch.extensions.register(new(Hello_Prime))