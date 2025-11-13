const endpointDaAPI = "http://localhost:3000/coffee";

// funções carrinho(localStorage)
function pegarCarrinho() {
  const carrinho = localStorage.getItem("cart");
  // console.log("pegarCarrinho: String do localStorage:", carrinho); 
  return carrinho ? JSON.parse(carrinho) : []; //se cart for nulo recebe array vazia
}

function salvarCarrinho(carrinho) {
  console.log("salvando no localStorage:", carrinho);
  localStorage.setItem("cart", JSON.stringify(carrinho)); //add ao localStorage transformando em String
  atualizarContadorCarrinho();//atualiza valor da bolinha do carrinho
}

//limpar o carrinho
function limparCarrinho() {
  console.log("carrinho limpo.");
  localStorage.removeItem("cart"); // remove o item
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(item) {//add ao carinho 
  console.log("tentando adicionar:", item);
  const carrinho = pegarCarrinho();
  const itemExistente = carrinho.find((itemDoCarrinho) => itemDoCarrinho.id == item.id); // Usando ==

  if (itemExistente) {//aqui só encrementa pq existe
    console.log("item já existe, incrementando quantidade.");
    itemExistente.quantity += 1;
  } else {//adciona um item novo ao carrinho
    console.log("item novo, adicionando ao carrinho.");
    carrinho.push({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  }
  salvarCarrinho(carrinho);

}

function atualizarContadorCarrinho() {
  const carrinho = pegarCarrinho();
  const totalDeItens = carrinho.reduce((soma, item) => soma + item.quantity, 0);//somando o array
  console.log("atualizando contagem para:", totalDeItens);
  const elementoContadorCarrinho = document.getElementById("cart-count");
  if (elementoContadorCarrinho) {
    elementoContadorCarrinho.textContent = totalDeItens;
  }
}

function incrementarItem(idDoItem) {
  console.log("tentando incrementar ID:", idDoItem);
  const carrinho = pegarCarrinho();
  const item = carrinho.find((i) => i.id == idDoItem); // usando == pq passei 4h nesse inferno 
  if (item) {
    console.log("item encontrado:", item);
    item.quantity += 1;
    salvarCarrinho(carrinho);
    renderizarPaginaCarrinho();
  } else {
    console.error("item não encontrado com ID:", idDoItem);
  }
}

function decrementarItem(idDoItem) {
  console.log("tentando decrementar ID:", idDoItem);
  let carrinho = pegarCarrinho();
  const item = carrinho.find((i) => i.id == idDoItem); // Usando ==

  if (item && item.quantity > 1) {
    console.log("item encontrado, diminuindo quantidade.");
    item.quantity -= 1;
  } else if (item) {
    console.log("item encontrado, removendo (quantidade era 1).");
    carrinho = carrinho.filter((i) => i.id != idDoItem); 
  } else {
    console.error("item não encontrado com ID:", idDoItem);
  }
  salvarCarrinho(carrinho);
  renderizarPaginaCarrinho();
}

function removerProdutoDoCarrinho(idDoItem) {
  console.log("tentando remover ID:", idDoItem);
  if (!confirm("Tem certeza de que deseja remover este item?")) {
    console.log("remoção cancelada pelo usuário");
    return;
  }
  let carrinho = pegarCarrinho();
  carrinho = carrinho.filter((i) => i.id != idDoItem); 
  console.log("item removido.");
  salvarCarrinho(carrinho);
  renderizarPaginaCarrinho();
}


//pagina

function limparRoot() {
  console.log("limparRoot: Limpando <div id='root'>.");
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.className = "container my-4"; 
  return root;
}

// pagina inicial
async function renderizarPaginaInicial() {
  console.log("renderizando página inicial");
  const root = limparRoot(); // limpa o root
  root.innerHTML = '<h2 class="mb-4">Nossos Cafés</h2>';

  // container para a grade de produtos
  const containerDaGrade = document.createElement("div");
  containerDaGrade.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4";
  //add parada do bootstrap
  
  //  Add o container depois do título
  root.appendChild(containerDaGrade);

  try {
    const dados = await buscarDados(endpointDaAPI);
    console.log("dados da API recebidos:", dados);
    dados.forEach((item) => {
      // cria os cards dentro (não mais no root)
      criarCardProduto(item, containerDaGrade);
    });
  } catch (erro) {
    // 5. se der ruim, exibe a mensagem
    console.error("falha ao buscar dados!", erro);
    containerDaGrade.innerHTML = `<div class="alert alert-danger">Erro ao carregar os produtos. Tente novamente.</div>`;
  }
}

//pagina do carrinho
function renderizarPaginaCarrinho() {
  console.log("renderizando página do carrinho...");
  const root = limparRoot();
  const carrinho = pegarCarrinho();
  root.innerHTML = `<h2 class="mb-3">Meu Carrinho</h2>`;

  if (carrinho.length === 0) {
    console.log("carrinho está vazio.");
    root.innerHTML += `<p class="alert alert-info">Seu carrinho está vazio.</p>`;
    return;
  }

  console.log("renderizando itens:", carrinho);
  const containerItensCarrinho = document.createElement("div");
  containerItensCarrinho.className = "mb-3";
  let total = 0;

  carrinho.forEach((item) => {
    total += item.price * item.quantity;
    const cardDoItem = document.createElement("div");
    cardDoItem.className = "card mb-2";
    cardDoItem.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
          <div><h5 class="card-title mb-0">${item.title}</h5><p class="card-text text-muted mb-0">R$ ${item.price.toFixed(2)}</p></div>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-secondary btn-sm cart-decrement" data-id="${item.id}">-</button>
          <span class="mx-3">${item.quantity}</span>
          <button class="btn btn-outline-secondary btn-sm cart-increment" data-id="${item.id}">+</button>
          <button class="btn btn-danger btn-sm ms-3 cart-remove" data-id="${item.id}"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `;
    containerItensCarrinho.appendChild(cardDoItem);
  });

  root.appendChild(containerItensCarrinho);

  const exibidorTotal = document.createElement("div");
  exibidorTotal.className = "d-flex justify-content-end align-items-center";
  exibidorTotal.innerHTML = `
    <h4 class="me-3">Total: <span id="cart-total">R$ ${total.toFixed(2)}</span></h4>
    <a href="#checkout" id="checkout-button" class="btn btn-success btn-lg">Finalizar Compra</a>
  `;
  root.appendChild(exibidorTotal);
}

// pagina checkout
function renderizarPaginaCheckout() {
  console.log("renderizando página de checkout");
  const root = limparRoot();
  const carrinho = pegarCarrinho();

  if (carrinho.length === 0) {
    console.log("carrinho está vazio.");
    root.innerHTML = `
      <h2 class="mb-3">Finalizar Compra</h2>
      <p class="alert alert-warning">Seu carrinho está vazio. Adicione itens para finalizar a compra.</p>
      <a href="#" class="btn btn-primary">Voltar para a loja</a>
    `;
    return;
  }

  let total = 0;
  
  console.log(" gerando resumo de itens...");
  // Resumo dos itens
  let htmlResumoItens = carrinho.map(item => {
    total += item.price * item.quantity;
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h6 class="my-0">${item.title}</h6>
          <small class="text-muted">Quantidade: ${item.quantity}</small>
        </div>
        <span class="text-muted">R$ ${(item.price * item.quantity).toFixed(2)}</span>
      </li>
    `;
  }).join("");

  console.log(" renderizando formulário.");
  // HTML do formulário
  root.innerHTML = `
    <h2 class="mb-4">Finalizar Compra</h2>
    <div class="row g-5">
      <div class="col-md-5 col-lg-4 order-md-last">
        <h4 class="d-flex justify-content-between align-items-center mb-3">
          <span class="text-primary">Seu carrinho</span>
          <span class="badge bg-primary rounded-pill">${carrinho.reduce((soma, i) => soma + i.quantity, 0)}</span>
        </h4>
        <ul class="list-group mb-3">
          ${htmlResumoItens}
          <li class="list-group-item d-flex justify-content-between">
            <span>Total (BRL)</span>
            <strong>R$ ${total.toFixed(2)}</strong>
          </li>
        </ul>
      </div>

      <div class="col-md-7 col-lg-8">
        <h4 class="mb-3">Endereço de Entrega</h4>
        <form id="checkout-form" class="needs-validation" novalidate>
          <div class="mb-3">
            <label for="address" class="form-label">Endereço</label>
            <input type="text" class="form-control" id="address" placeholder="Rua, número, bairro..." required>
            <div class="invalid-feedback">Por favor, insira seu endereço.</div>
          </div>

          <hr class="my-4">

          <h4 class="mb-3">Pagamento</h4>
          <div class="my-3">
            <div class="form-check">
              <input id="credit" name="paymentMethod" type="radio" class="form-check-input" required>
              <label class="form-check-label" for="credit">Cartão de Crédito</label>
            </div>
            <div class="form-check">
              <input id="pix" name="paymentMethod" type="radio" class="form-check-input" required>
              <label class="form-check-label" for="pix">PIX</label>
            </div>
             <div class="form-check">
              <input id="boleto" name="paymentMethod" type="radio" class="form-check-input" required>
              <label class="form-check-label" for="boleto">Boleto</label>
            </div>
          </div>

          <hr class="my-4">

          <button class="w-100 btn btn-success btn-lg" type="submit">Finalizar Compra</button>
        </form>
      </div>
    </div>
  `;

  //add o listener de submit no formulário
  const formulario = document.getElementById("checkout-form");
  console.log(" adicionando ao formulário.");
  formulario.addEventListener("submit", lidarComEnvioCheckout);
}


async function buscarDados(urlDaApi) {
  console.log("buscando dados de:", urlDaApi);
  try {
    const resposta = await fetch(urlDaApi);
    console.log("resposta recebida:", resposta.status);
    if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
    const dadosJson = await resposta.json();
    console.log("dados convertidos para JSON.");
    return dadosJson;
  } catch (erro) {
    console.error("falha na requisição:", erro);
    throw erro;
  }
}

function criarCardProduto(dados, root) {
  // console.log(" criando card para:", dados.title); 
  const coluna = document.createElement("div");
  coluna.className = "col";
  const card = document.createElement("div");
  card.className = "card h-100";
  card.innerHTML = `
    <img src="${dados.image}" class="card-img-top" alt="${dados.title}">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${dados.title}</h5>
      <p class="card-text">${dados.description}</p>
      <h6 class="card-subtitle mb-2 text-muted">R$ ${dados.price.toFixed(2)}</h6>
      <ul class="list-group list-group-flush mb-3">
        ${dados.ingredients.map((ing) => `<li class="list-group-item py-1">${ing}</li>`).join("")}
      </ul>
      <button class="btn btn-primary mt-auto product-add-btn" data-id="${dados.id}">Adicionar ao Carrinho</button>
    </div>
  `;
  
  //add listener no botão
  card.querySelector(".product-add-btn").onclick = () => {
    console.log("adicionar ao Carrinho", dados);
    adicionarAoCarrinho(dados);
  };
  
  coluna.appendChild(card);
  root.appendChild(coluna);
}

//formulario
function lidarComEnvioCheckout(evento) {
  console.log("formulário enviado.");
  evento.preventDefault(); //impede a recarga da pag
  const formulario = evento.target;

  //validação do Bootstrap
  if (!formulario.checkValidity()) {
    evento.stopPropagation();
    formulario.classList.add("was-validated");
    return; //caso o formulário for inválido
  }

  //se for válido
  console.log(" formulário válido. Processando compra.");
  formulario.classList.add("was-validated");

  
  limparCarrinho(); //limpa o carrinho no localStorage 

  
  console.log("lidarComEnvioCheckout: Compra finalizada. Exibindo sucesso.");
  const root = document.getElementById("root"); //mensagem de confirmação 
  root.innerHTML = `
    <div class="alert alert-success text-center" role="alert">
      <h4 class="alert-heading">Compra realizada com sucesso!</h4>
      <p>Obrigado por comprar conosco. Seu pedido está sendo preparado.</p>
      <hr>
      <a href="#" class="btn btn-success">Voltar para a loja</a>
    </div>
  `;
  
}


//paginas
function roteador() {
  const hash = window.location.hash;
  console.log(" hash da URL mudou para:", hash);
  if (hash === "#cart") {
    console.log("indo para Carrinho.");
    renderizarPaginaCarrinho();
  } else if (hash === "#checkout") {
    console.log("indo para Checkout.");
    renderizarPaginaCheckout();
  } else {
    console.log("indo para Home.");
    renderizarPaginaInicial();
  }
}

window.addEventListener("hashchange", roteador);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM: Conteúdo carregado. Iniciando script.");
  atualizarContadorCarrinho();
  roteador();
});

// botoes do checkout
document.addEventListener("click", (evento) => {
  // console.log("clique global detectado em:", evento.target);
  const botaoIncrementar = evento.target.closest(".cart-increment");
  const botaoDecrementar = evento.target.closest(".cart-decrement");
  const botaoRemover = evento.target.closest(".cart-remove");

  if (botaoIncrementar) {
    console.log("botão de Incrementar clicado.");
    const id = parseInt(botaoIncrementar.dataset.id);
    incrementarItem(id);
  }
  if (botaoDecrementar) {
    console.log("botão de Decrementar clicado.");
    const id = parseInt(botaoDecrementar.dataset.id);
    decrementarItem(id);
  }
  if (botaoRemover) {
    console.log("botão de Remover clicado.");
    const id = parseInt(botaoRemover.dataset.id);
    removerProdutoDoCarrinho(id);
  }
});