import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

/*El simbolo de $ es para indicar que la variable es 
un elemento del DOM*/

let messages = [];

// web worker
//verificar si existe el worker

const $ = (elem) => document.querySelector(elem);

const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $messages = $("ul");
const $container = $("main");
const $button = $("button");
const $info = $("small");

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";

const engine = await CreateWebWorkerMLCEngine(
  new Worker('/worker.js', { type: "module" }),
  SELECTED_MODEL, {
  initProgressCallback: (info) => {
    console.log("initProgressCallback", info);
    $info.textContent = `${info.text}%`;
    if (info.progress === 1) {
      $button.removeAttribute("disabled");
    }
  },
});

$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = $input.value.trim();

  if (messageText !== "") {
    //añadimos mensaje en el DOM
    $input.value = "";
  }

  addMessage(messageText, "user");
  $button.setAttribute("disabled", "");

  const userMessage = {
    role: "user",
    content: messageText,
  };

  messages.push(userMessage);

  const chunks = await engine.chat.complentions.create({
    messages,
    stream: true,
  });

  let response = "";
  const $botMessage = addMessage("", "bot");

  for await (const chunk of chunks) {
    const [choice] = chunk.choices;
    const content = choice?.delta?.content ?? "";
    response += content;
    $botMessage.textContent = response;
  }

  console.log(response);
  $button.removeAttribute("disabled");
  messages.push({
    role: "assistant",
    content: response,
  });
  $container.scrollTop = $container.scrollHeight;

  const botMessage = response.choices[0].message.content;
  messages.push(botMessage);
});

function addMessage(text, sender) {
  // clonar template
  const clonedTemplate = $template.content.cloneNode(true);
  const $newMessage = clonedTemplate.querySelector(".message");

  const $who = $newMessage.querySelector("span");
  const $text = $newMessage.querySelector("p");

  $text.textContent = text;
  $who.textContent = sender === "bot" ? "GPT" : "Tú";
  $newMessage.classList.add(sender);

  // actualizar Scroll para ir bajando
  $messages.appendChild($newMessage);
  $container.scrollTop = $container.scrollHeight;

  return $text;
}
