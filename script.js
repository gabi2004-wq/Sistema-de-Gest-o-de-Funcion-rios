const form = document.getElementById("formFuncionario");
const tabela = document.getElementById("tabelaFuncionarios");
const pesquisa = document.getElementById("pesquisa");
const mensagem = document.getElementById("mensagem");

const totalFuncionarios = document.getElementById("totalFuncionarios");
const folhaSalarial = document.getElementById("folhaSalarial");
const totalDepartamentos = document.getElementById("totalDepartamentos");

const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");

let funcionarios = [];
let funcionarioEditando = null;

try {
    funcionarios = JSON.parse(localStorage.getItem("gestaoFuncionarios")) || [];
} catch {
    funcionarios = [];
}

function salvarDados() {
    localStorage.setItem("gestaoFuncionarios", JSON.stringify(funcionarios));
}

function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function limparFormulario() {
    form.reset();
    funcionarioEditando = null;
    botaoSalvar.textContent = "Cadastrar funcionário";
    botaoCancelar.hidden = true;
}

function atualizarIndicadores() {
    totalFuncionarios.textContent = funcionarios.length;

    const folha = funcionarios.reduce((total, funcionario) => {
        return total + funcionario.salario;
    }, 0);

    folhaSalarial.textContent = folha.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    const departamentos = new Set(
        funcionarios.map(funcionario => funcionario.departamento)
    );

    totalDepartamentos.textContent = departamentos.size;
}

function criarCelula(linha, valor) {
    const celula = document.createElement("td");
    celula.textContent = valor;
    linha.appendChild(celula);
}

function exibirFuncionarios() {
    tabela.replaceChildren();

    const termo = pesquisa.value.toLowerCase().trim();

    const filtrados = funcionarios.filter(funcionario => {
        return (
            funcionario.nome.toLowerCase().includes(termo) ||
            funcionario.cpf.includes(termo) ||
            funcionario.cargo.toLowerCase().includes(termo) ||
            funcionario.departamento.toLowerCase().includes(termo)
        );
    });

    filtrados.forEach(funcionario => {
        const linha = document.createElement("tr");

        criarCelula(linha, funcionario.nome);
        criarCelula(linha, funcionario.cpf);
        criarCelula(linha, funcionario.cargo);
        criarCelula(linha, funcionario.departamento);

        criarCelula(
            linha,
            funcionario.salario.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        );

        criarCelula(
            linha,
            new Date(funcionario.dataContratacao + "T00:00:00")
                .toLocaleDateString("pt-BR")
        );

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "botao-editar";
        botaoEditar.type = "button";
        botaoEditar.addEventListener("click", () => editarFuncionario(funcionario.id));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.type = "button";
        botaoExcluir.addEventListener("click", () => excluirFuncionario(funcionario.id));

        celulaAcoes.append(botaoEditar, botaoExcluir);
        linha.appendChild(celulaAcoes);

        tabela.appendChild(linha);
    });

    const tabelaVazia = document.getElementById("tabelaVazia");
    tabelaVazia.hidden = filtrados.length > 0;

    if (filtrados.length === 0) {
        tabelaVazia.textContent = funcionarios.length === 0
            ? "Nenhum funcionário cadastrado."
            : "Nenhum funcionário encontrado.";
    }

    atualizarIndicadores();
}

form.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const cargo = document.getElementById("cargo").value.trim();
    const departamento = document.getElementById("departamento").value;
    const salario = Number(document.getElementById("salario").value);
    const dataContratacao = document.getElementById("dataContratacao").value;

    if (!nome || !cpf || !cargo || !departamento || !dataContratacao || salario <= 0) {
        mostrarMensagem("Preencha todos os campos corretamente.", "erro");
        return;
    }

    const cpfDuplicado = funcionarios.some(funcionario =>
        funcionario.cpf === cpf && funcionario.id !== funcionarioEditando
    );

    if (cpfDuplicado) {
        mostrarMensagem("Já existe um funcionário cadastrado com esse CPF.", "erro");
        return;
    }

    const dadosFuncionario = {
        id: funcionarioEditando ?? Date.now(),
        nome,
        cpf,
        cargo,
        departamento,
        salario,
        dataContratacao
    };

    if (funcionarioEditando !== null) {
        funcionarios = funcionarios.map(funcionario =>
            funcionario.id === funcionarioEditando
                ? dadosFuncionario
                : funcionario
        );

        mostrarMensagem("Funcionário atualizado com sucesso!");
    } else {
        funcionarios.push(dadosFuncionario);
        mostrarMensagem("Funcionário cadastrado com sucesso!");
    }

    salvarDados();
    limparFormulario();
    exibirFuncionarios();
});

function editarFuncionario(id) {
    const funcionario = funcionarios.find(item => item.id === id);

    if (!funcionario) return;

    document.getElementById("nome").value = funcionario.nome;
    document.getElementById("cpf").value = funcionario.cpf;
    document.getElementById("cargo").value = funcionario.cargo;
    document.getElementById("departamento").value = funcionario.departamento;
    document.getElementById("salario").value = funcionario.salario;
    document.getElementById("dataContratacao").value = funcionario.dataContratacao;

    funcionarioEditando = id;
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;

    mostrarMensagem("Editando cadastro do funcionário.");
    form.scrollIntoView({ behavior: "smooth" });
}

function excluirFuncionario(id) {
    const confirmar = confirm("Deseja realmente excluir este funcionário?");

    if (!confirmar) return;

    funcionarios = funcionarios.filter(funcionario => funcionario.id !== id);

    if (funcionarioEditando === id) {
        limparFormulario();
    }

    salvarDados();
    exibirFuncionarios();
    mostrarMensagem("Funcionário excluído com sucesso!");
}

botaoCancelar.addEventListener("click", function() {
    limparFormulario();
    mostrarMensagem("Edição cancelada.");
});

pesquisa.addEventListener("input", exibirFuncionarios);

exibirFuncionarios();