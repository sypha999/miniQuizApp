export let answers = [];

export async function getQuestions(amount="10",difficulty="easy",category="9"){
  const params = new URLSearchParams();

  params.append("amount", amount);
  params.append("token", await getToken());
  params.append("type", "multiple");
  params.append("difficulty", difficulty);
  params.append("category", category);

  const url = `https://opentdb.com/api.php?${params.toString()}`;
  const req = await fetch(url);
  const response = await req.json();
  let id = 1;
  for(const obj of response.results){
    obj.id = id;
    id++;
  }
  return response.results;
}


export async function getToken(){
  const req = await fetch('https://opentdb.com/api_token.php?command=request',{})
  let response = await req.json();
  return response.token;
}

export  function getScoreInPercentage(total,score){
  return (score/total)*100;
}

export function excludeAnswers(questions){
  answers = []
  for(const question of questions){
    answers.push({
      id: question.id,
      answer: question.correct_answer,
    });
    question.incorrect_answers.push(question.correct_answer);
    shuffleArray(question.incorrect_answers);
    question.correct_answer="";
  }
return questions;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

