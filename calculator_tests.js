
class ExpressionError extends Error {}
class DivisionByZeroError extends Error {}
class E {
  evaluate(input){
    const s=input.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replace(/\s+/g,"");
    if(!s) throw new ExpressionError();
    this.t=this.tokenize(s); this.i=0; const v=this.expr();
    if(this.i!==this.t.length || !Number.isFinite(v)) throw new ExpressionError();
    return v;
  }
  tokenize(s){
    let a=[],i=0;
    while(i<s.length){
      let c=s[i];
      if(/[0-9.]/.test(c)){
        let n="",d=0;
        while(i<s.length&&/[0-9.]/.test(s[i])){if(s[i]===".")d++;if(d>1)throw new ExpressionError();n+=s[i++];}
        if(n===".")throw new ExpressionError(); let v=Number(n); if(!Number.isFinite(v))throw new ExpressionError(); a.push({type:"n",value:v}); continue;
      }
      if("+-*/()".includes(c)){a.push({type:c});i++;continue;}
      throw new ExpressionError();
    }
    return a;
  }
  cur(x){return this.t[this.i]?.type===x}
  take(x){if(!this.cur(x))throw new ExpressionError();return this.t[this.i++]}
  expr(){let v=this.term();while(this.cur("+")||this.cur("-")){let o=this.t[this.i++].type,r=this.term();v=o==="+"?v+r:v-r}return v}
  term(){let v=this.unary();while(this.cur("*")||this.cur("/")){let o=this.t[this.i++].type,r=this.unary();if(o==="/"){if(Math.abs(r)<Number.EPSILON)throw new DivisionByZeroError();v/=r}else v*=r}return v}
  unary(){if(this.cur("+")){this.i++;return this.unary()}if(this.cur("-")){this.i++;return-this.unary()}return this.primary()}
  primary(){if(this.cur("n"))return this.t[this.i++].value;if(this.cur("(")){this.i++;let v=this.expr();this.take(")");return v}throw new ExpressionError()}
}
function fmt(v){if(Object.is(v,-0))v=0;let r=Number.parseFloat(v.toPrecision(12)),a=Math.abs(r);if((a!==0&&a<1e-9)||a>=1e12)return r.toExponential(8).replace(/\.?0+e/,"e");return String(r)}
const e=new E();
const good=[
["2+3×4",14],["(2+3)×4",20],["10÷(2+3)",2],["2×(3+(4×5))",46],
["8÷2×4",16],["10−3−2",5],["0.1+0.2",0.3],["-5+2",-3],
["3.5×2",7],["-(2+3)×4",-20],["2×-3",-6],["((2+3)×(4−1))",15]
];
let passed=0;
for(const [x,y] of good){const z=e.evaluate(x);if(Math.abs(z-y)>1e-10)throw new Error(x);passed++}
for(const x of ["1÷0","(2+3","2+","","2..3+1","2+abc"]){let ok=false;try{e.evaluate(x)}catch{ok=true}if(!ok)throw new Error("bad:"+x);passed++}
if(fmt(e.evaluate("0.1+0.2"))!=="0.3")throw new Error("float");passed++;
let h=[];for(let i=0;i<12;i++){h.unshift({i});h=h.slice(0,10)}if(h.length!==10||h[0].i!==11||h[9].i!==2)throw new Error("history");passed++;
console.log(JSON.stringify({status:"PASS",passed,total:20}));
