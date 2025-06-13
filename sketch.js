let gotas = [];
let plantas = [];
let caminhao;
let currentScene = 'campo';
let carregandoVerdura = false; // Indica se há verdura visível no caminhão
let entregouVerdura = false; // Flag para controlar a entrega no mercado

// --- Novos elementos: Casa e Trabalhador Rural ---
let casa; // Variável para armazenar o objeto da casa
let trabalhadorRural; // Variável para armazenar a instância do trabalhador rural

// --- Nova variável para a fala rural ---
let falaRural = {
  texto: "",
  visivel: false,
  tempoInicial: 0,
  duracao: 180 // Duração em frames (aproximadamente 3 segundos a 60fps)
};

// Classe para o Trabalhador Rural
class TrabalhadorRural {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.altura = 40; // Altura base do corpo
    this.velocidade = 0.5; // Velocidade de caminhada
    this.direcao = 1; // 1 para direita, -1 para esquerda
    this.balancoPernas = 0; // Para animação de pernas
    this.balancoBracos = 0; // Para animação de braços
    this.velocidadeBalanco = 0.1; // Velocidade do movimento dos membros
  }

  // Método para atualizar a posição e animação
  update() {
    this.x += this.velocidade * this.direcao;

    // Inverte a direção se atingir as bordas ou um ponto específico no campo
    // Mantemos o trabalhador andando na área visível do campo (entre 20% e 80% da largura da tela)
    if (this.x > width * 0.8 || this.x < width * 0.2) {
      this.direcao *= -1; // Inverte a direção
    }

    // Animação de caminhada: usa a função seno para criar um movimento suave e repetitivo
    this.balancoPernas = sin(frameCount * this.velocidadeBalanco) * 5; // Pequeno balanço para pernas
  }

  // Método para desenhar o trabalhador rural
  display() {
    push(); // Salva o estado atual do estilo (cor, stroke, etc.)
    translate(this.x, this.y); // Move a origem para a posição do trabalhador, facilitando o desenho das partes do corpo

    // Cabeça (chapéu de palha)
    fill(230, 200, 100); // Cor de chapéu
    ellipse(0, -this.altura / 2 - 10, 25, 20); // Base do chapéu
    triangle(-15, -this.altura / 2 - 15, 0, -this.altura / 2 - 25, 15, -this.altura / 2 - 15); // Topo do chapéu

    fill(255, 200, 150); // Cor da pele
    ellipse(0, -this.altura / 2 - 10, 20, 20); // Cabeça

    // Corpo (camisa simples)
    fill(100, 150, 50); // Verde para a camisa
    rect(-10, -this.altura / 2, 20, this.altura); // Corpo

    // Braços (FIXOS)
    fill(100, 150, 50); // Mesma cor da camisa
    rect(-15, -this.altura / 4, 10, this.altura / 2); // Braço esquerdo (posição fixa)
    rect(5, -this.altura / 4, 10, this.altura / 2); // Braço direito (posição fixa)

    // Pernas (calça)
    fill(50, 50, 150); // Azul para a calça
    rect(-8 + this.balancoPernas, this.altura / 2 - 5, 8, this.altura * 0.6); // Perna esquerda (movida pelo balanço)
    rect(0 - this.balancoPernas, this.altura / 2 - 5, 8, this.altura * 0.6); // Perna direita (movida pelo balanço oposto)

    // Botas
    fill(80, 40, 0); // Cor das botas
    rect(-8 + this.balancoPernas, this.altura * 1.1, 8, 5); // Bota esquerda
    rect(0 - this.balancoPernas, this.altura * 1.1, 8, 5); // Bota direita

    pop(); // Restaura o estado anterior do estilo
  }
}

function setup() {
  createCanvas(800, 500); // Aumentei o tamanho da tela para melhor visualização

  // Inicializa o caminhão
  caminhao = {
    x: -180, // Começa mais à esquerda, fora da tela
    y: height - 100, // Posição vertical para ficar na "estrada" no campo
    largura: 120,
    altura: 60,
    velocidade: 1.5, // Velocidade inicial do caminhão
    verdurasNoCaminhao: 0, // 0 = vazio, 1 = carregado
    estado: 'aguardando_carregamento' // Novo estado para controlar o que o caminhão está fazendo
  };

  // Inicializa a casa
  casa = {
    x: width * 0.7, // Posição X da casa (mais à direita no campo)
    y: height / 2 - 40, // Posição Y da casa (acima do chão do campo)
    largura: 60,
    altura: 50
  };

  // Inicializa o trabalhador rural
  // Ele aparece na parte inferior do campo, andando sobre a "terra"
  trabalhadorRural = new TrabalhadorRural(width * 0.2, height / 2 + 50);

  // Inicializa o mercado (permanece na cidade, mas precisa ser inicializado no setup)
  mercado = {
    x: width * 0.7, // Posição X do mercado na cidade
    y: height / 2 - 100, // Posição Y do mercado
    largura: 100,
    altura: 100
  };
}

function draw() {
  background(220); // Cor de fundo padrão

  // --- Desenha e Gerencia Cenas ---
  if (currentScene === 'campo') {
    drawCampo();
    // Lógica para o caminhão no campo
    // Define a posição Y do caminhão no campo
    caminhao.y = height - 100;

    if (caminhao.estado === 'aguardando_carregamento') {
      caminhao.velocidade = 1.5; // Move para a área de carregamento
      if (caminhao.x > 80 && caminhao.x < 150) { // Ponto para o caminhão parar e carregar
        caminhao.velocidade = 0; // Para o caminhão
        caminhao.estado = 'carregando';
      }
    } else if (caminhao.estado === 'carregando') {
      // Simula o tempo de carregamento
      if (frameCount % 120 === 0 && caminhao.verdurasNoCaminhao === 0) { // Carrega a cada 2 segundos (120 frames)
        caminhao.verdurasNoCaminhao = 1;
        carregandoVerdura = true;
        print("Verduras carregadas no campo!");
        caminhao.estado = 'indo_cidade'; // Mudar para o estado de viagem
        caminhao.velocidade = 1.5; // Caminhão volta a se mover
      }
    } else if (caminhao.estado === 'retornando_campo') {
      caminhao.velocidade = 1.5; // Continua voltando
      if (caminhao.x >= -180 && caminhao.x < 0) { // Reset quando o caminhão está fora da tela à esquerda
        caminhao.estado = 'aguardando_carregamento';
        caminhao.verdurasNoCaminhao = 0;
        carregandoVerdura = false;
        entregouVerdura = false; // Reseta a flag para a próxima entrega
        print("Caminhão retornou ao campo e está aguardando novo carregamento.");
      }
    }

    // Transição do campo para a cidade (se estiver carregado)
    if (caminhao.x > width && caminhao.verdurasNoCaminhao === 1 && caminhao.estado === 'indo_cidade') {
      currentScene = 'cidade';
      caminhao.x = -caminhao.largura; // Aparece do outro lado da tela
      caminhao.y = height / 2 - caminhao.altura / 2 + 10; // Alinha com a base dos prédios
      print("Caminhão chegou à cidade.");
    }

  } else if (currentScene === 'cidade') {
    drawCidade();
    // Lógica para o caminhão na cidade
    caminhao.y = height / 2 - caminhao.altura / 2 + 10; // Garante que permaneça na linha dos prédios

    if (caminhao.estado === 'indo_cidade') {
      let pontoDeParadaIdeal = mercado.x + mercado.largura / 3 - caminhao.largura * 0.7; // Alinha com a porta do mercado

      if (caminhao.x >= pontoDeParadaIdeal && caminhao.verdurasNoCaminhao === 1) {
        caminhao.x = pontoDeParadaIdeal; // Garante a posição exata
        caminhao.velocidade = 0; // Para o caminhão
        caminhao.estado = 'descarregando';
        print("Caminhão parou no mercado para descarregar.");
      }
    } else if (caminhao.estado === 'descarregando') {
      // Simula o tempo de descarregamento
      if (frameCount % 120 === 0 && caminhao.verdurasNoCaminhao === 1 && !entregouVerdura) {
        caminhao.verdurasNoCaminhao = 0;
        carregandoVerdura = false;
        entregouVerdura = true; // Marca que a entrega foi feita
        print("Verduras descarregadas no mercado!");
        caminhao.estado = 'retornando_campo'; // Mudar para o estado de retorno
        caminhao.velocidade = 1.5; // Caminhão volta a se mover
      }
    }

    // Transição da cidade para o campo (se estiver descarregado)
    if (caminhao.x > width && caminhao.verdurasNoCaminhao === 0 && caminhao.estado === 'retornando_campo') {
      currentScene = 'campo';
      caminhao.x = -caminhao.largura; // Aparece do outro lado da tela
      caminhao.y = height - 100; // Posição vertical para ficar na "estrada" no campo
      print("Caminhão retornando ao campo.");
    }
  }

  // --- Desenha e Atualiza Elementos Comuns ---

  // Desenha e atualiza as plantas
  for (let i = 0; i < plantas.length; i++) {
    let planta = plantas[i];
    fill(0, 128, 0); // Verde para as plantas
    ellipse(planta.x, planta.y, planta.tamanho, planta.tamanho);
    planta.tamanho += planta.crescimento;
    if (planta.tamanho > 30) {
      planta.tamanho = 30; // Limite de tamanho
    }
  }

  // Cria e desenha as gotas de chuva
  let chovendoAgora = false; // Flag para verificar se está chovendo neste frame
  if (frameCount % 5 === 0) {
    gotas.push({
      x: random(width),
      y: 0,
      tamanho: random(5, 15),
      velocidade: random(5, 10)
    });
    // Se novas gotas estão sendo criadas, significa que está chovendo
    chovendoAgora = true;
  }

  // Se está chovendo e a fala não está visível, ative-a
  if (chovendoAgora && !falaRural.visivel && currentScene === 'campo') {
    falaRural.texto = "Finalmente chuva!";
    falaRural.visivel = true;
    falaRural.tempoInicial = frameCount;
  }

  for (let i = 0; i < gotas.length; i++) {
    let gota = gotas[i];
    fill(100, 150, 200); // Azul claro para as gotas
    ellipse(gota.x, gota.y, 2, gota.tamanho);
    gota.y += gota.velocidade;
    if (gota.y > height) {
      gotas.splice(i, 1); // Remove gota que saiu da tela
      i--;
    }
    for (let j = 0; j < plantas.length; j++) {
      let planta = plantas[j];
      let distancia = dist(gota.x, gota.y, planta.x, planta.y);
      if (distancia < planta.tamanho / 2) { // Se a gota atingir a planta
        planta.crescimento += 0.01; // Faz a planta crescer mais rápido
        gotas.splice(i, 1); // Remove a gota
        i--;
        break;
      }
    }
  }

  // --- Desenha o Caminhão ---
  fill(255, 0, 0); // Cor vermelha para o caminhão
  rect(caminhao.x, caminhao.y, caminhao.largura, caminhao.altura);
  fill(200); // Janela
  rect(caminhao.x + caminhao.largura * 0.7, caminhao.y + 10, caminhao.largura * 0.25, 20);
  fill(0); // Rodas
  ellipse(caminhao.x + caminhao.largura * 0.2, caminhao.y + caminhao.altura, 25, 25);
  ellipse(caminhao.x + caminhao.largura * 0.8, caminhao.y + caminhao.altura, 25, 25);

  // Se estiver carregando, desenha a verdura no caminhão
  if (carregandoVerdura) {
    fill(0, 255, 0, 150); // Verde translúcido para as verduras
    rect(caminhao.x + 10, caminhao.y - 15, caminhao.largura - 20, 15);
  }

  // Move o caminhão
  caminhao.x += caminhao.velocidade;

  // --- Desenha a fala rural, se visível ---
  if (falaRural.visivel) {
    // Verifica se o tempo de duração da fala expirou
    if (frameCount - falaRural.tempoInicial > falaRural.duracao) {
      falaRural.visivel = false; // Desativa a fala
    } else {
      // Desenha o balão de fala
      fill(255); // Cor branca para o balão
      stroke(0); // Borda preta
      rect(trabalhadorRural.x - 50, trabalhadorRural.y - 90, 100, 40, 5); // Balão de fala arredondado

      // Desenha o "rabinho" do balão de fala
      triangle(trabalhadorRural.x - 10, trabalhadorRural.y - 50,
               trabalhadorRural.x + 10, trabalhadorRural.y - 50,
               trabalhadorRural.x, trabalhadorRural.y - 40);

      fill(0); // Cor preta para o texto
      textSize(12);
      textAlign(CENTER, CENTER);
      text(falaRural.texto, trabalhadorRural.x, trabalhadorRural.y - 70);
    }
  }
}

// --- Funções de Desenho das Cenas ---

function drawCampo() {
  fill(139, 69, 19); // Terra
  rect(0, height / 2, width, height / 2);
  fill(100, 200, 100); // Grama
  rect(0, height / 2 - 20, width, 20);

  // Desenha a casa no campo
  drawCasa();

  // Desenha e atualiza o trabalhador rural
  trabalhadorRural.update(); // Atualiza a posição e animação
  trabalhadorRural.display(); // Desenha o trabalhador
}

function drawCidade() {
  fill(100); // Asfalto
  rect(0, height / 2, width, height / 2); // Asfalto

  // Prédio 1
  fill(80); // Cor do prédio
  rect(50, height / 2 - 150, 70, 150);
  fill(255, 255, 0, 200); // Luz amarela semitransparente
  rect(55, height / 2 - 140, 15, 15); // Janela 1
  rect(75, height / 2 - 140, 15, 15); // Janela 2
  rect(55, height / 2 - 110, 15, 15); // Janela 3
  rect(75, height / 2 - 110, 15, 15); // Janela 4
  rect(55, height / 2 - 80, 15, 15); // Janela 5
  rect(75, height / 2 - 80, 15, 15); // Janela 6

  // Prédio 2
  fill(80);
  rect(180, height / 2 - 100, 50, 100);
  fill(255, 255, 0, 200);
  rect(185, height / 2 - 90, 10, 10);
  rect(200, height / 2 - 90, 10, 10);
  rect(185, height / 2 - 70, 10, 10);
  rect(200, height / 2 - 70, 10, 10);

  // Prédio 3
  fill(80);
  rect(300, height / 2 - 180, 80, 180);
  fill(255, 255, 0, 200);
  rect(305, height / 2 - 170, 20, 20);
  rect(330, height / 2 - 170, 20, 20);
  rect(355, height / 2 - 170, 20, 20);
  rect(305, height / 2 - 140, 20, 20);
  rect(330, height / 2 - 140, 20, 20);
  rect(355, height / 2 - 140, 20, 20);

  // Prédio 4
  fill(80);
  rect(450, height / 2 - 120, 60, 120);
  fill(255, 255, 0, 200);
  rect(455, height / 2 - 110, 15, 15);
  rect(475, height / 2 - 110, 15, 15);
  rect(495, height / 2 - 110, 15, 15);
  rect(455, height / 2 - 80, 15, 15);
  rect(475, height / 2 - 80, 15, 15);
  rect(495, height / 2 - 80, 15, 15);

  // Desenha o mercado
  drawMercado();
}

function drawCasa() {
  fill(200, 150, 100); // Cor da casa (tom de madeira/tijolo claro)
  rect(casa.x, casa.y, casa.largura, casa.altura);
  // Telhado
  fill(150, 100, 50); // Cor do telhado (marrom escuro)
  triangle(casa.x - 10, casa.y, casa.x + casa.largura / 2, casa.y - 20, casa.x + casa.largura + 10, casa.y);
  // Porta
  fill(100, 50, 0); // Cor da porta
  rect(casa.x + casa.largura * 0.35, casa.y + casa.altura * 0.6, casa.largura * 0.3, casa.altura * 0.4);
  // Janelas
  fill(180, 220, 255); // Azul claro para a janela (vidro)
  rect(casa.x + casa.largura * 0.1, casa.y + casa.altura * 0.2, casa.largura * 0.2, casa.altura * 0.3);
  rect(casa.x + casa.largura * 0.7, casa.y + casa.altura * 0.2, casa.largura * 0.2, casa.altura * 0.3);
}

function drawMercado() {
  fill(170, 170, 0); // Cor amarelada para o mercado
  rect(mercado.x, mercado.y, mercado.largura, mercado.altura);
  fill(255); // Porta do mercado
  rect(mercado.x + mercado.largura / 3, mercado.y + mercado.altura * 0.6, mercado.largura / 3, mercado.altura * 0.4);
  fill(0);
  textSize(14); // Tamanho maior para o texto
  textAlign(CENTER, CENTER);
  text("MERCADO", mercado.x + mercado.largura / 2, mercado.y + mercado.altura * 0.2);
}

// --- Interação do Usuário ---

function mousePressed() {
  // Apenas permite criar plantas no campo
  if (currentScene === 'campo') {
    let tamanho = random(10, 20);
    fill(0, 128, 0);
    ellipse(mouseX, mouseY, tamanho, tamanho);
    plantas.push({
      x: mouseX,
      y: mouseY,
      tamanho: tamanho,
      crescimento: 0.05
    });
  }
}