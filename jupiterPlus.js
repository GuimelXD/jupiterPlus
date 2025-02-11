// ==UserScript==
// @name         Jupiter+
// @namespace    http://tampermonkey.net/
// @version      2025-02-10
// @description  Script para adicionar funcionalidades ao JupiterWeb
// @author       Guimel Paranhos (Eng. Elétrica)
// @match        https://uspdigital.usp.br/jupiterweb/*
// @icon         https://uspdigital.usp.br/comumwebdev/imagens/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let urlAtual = window.location.href;
    let funcaoAtual;

    if (urlAtual.startsWith("evolucaoCurso", 37)){
        funcaoAtual = "evolucaoCurso";

        document.getElementById("enviar").addEventListener("click", startContadorCreditos);
    
        function startContadorCreditos(){
            setTimeout(() => {
    
                // Criando um container principal
                let container = document.createElement("div");
                container.style.position = "fixed";
                container.style.bottom = "20px";
                container.style.right = "20px";
                container.style.padding = "10px";
                container.style.background = "rgba(255, 255, 255, 0.95)";
                container.style.color = "#000";
                container.style.fontSize = "14px";
                container.style.borderRadius = "8px";
                container.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";
                // container.style.maxWidth = "400px";
                container.style.textAlign = "center";
                container.style.fontFamily = "Arial, sans-serif";
                container.innerHTML = `
                <style>
                    #meuContainer * { font-family: Arial, sans-serif; }
                    .habilitada { background-color: green; border: 3px solid green; border-radius: 10px; }
                    .desabilitada { background-color: red; border: 3px solid red; border-radius: 10px; }
                    .botao { padding: 8px 12px; margin: 5px; border: none; cursor: pointer; font-size: 14px; border-radius: 5px; }
                    .iniciar { background: #28a745; color: white; }
                    .limpar { background: #dc3545; color: white; }
                    .manual { background: #007bff; color: white; }
                    .parar { background: #ffc107; color: black; }
                    .ativo { border: 2px solid #007bff; }
                    #meuContainer table { width: 100%; border-collapse: collapse; }
                    #meuContainer th, #meuContainer td { padding: 8px; text-align: center; border-bottom: 1px solid #ddd; }
                    #meuContainer th { background: #222; color: #fff; }
                    .cursadas { background: rgb(0, 192, 0); color: white; }
                    .cursando { background: rgb(255, 255, 128); color: black; }
                    .a_cursar { background: rgb(255, 160, 96); color: black; }
                    .eletivas { background: rgb(192, 192, 192); color: black; }
                </style>
    
                <div id="meuContainer">
                    <!-- Container de Contagem Manual -->
                    <div id="contagem_manual">
                        <strong>Contagem Manual</strong>
                        <strong id="manualCountingStatus" class="desabilitada">Desabilitada</strong>
                        <table style="margin-top: 5px;" >
                            <thead>
                                <tr>
                                    <th>Créd. Aula</th>
                                    <th>Créd. Trabalho</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="manual_aula">0</td>
                                    <td id="manual_trabalho">0</td>
                                    <td id="manual_total">0</td>
                                </tr>
                            </tbody>
                        </table>
                        <button id="iniciarManual" class="botao manual">Iniciar Contagem</button>
                        <button id="pararManual" class="botao parar">Parar Contagem</button>
                        <button id="limparManual" class="botao limpar">Limpar Contagem Manual</button>
                    </div>
    
                    <hr>
    
                    <!-- Container de Cálculo Automático -->
                    <button id="iniciarCalculo" class="botao iniciar">Iniciar Cálculo Automático</button>
                    <button id="limparCalculo" class="botao limpar">Limpar Contagem Automática</button>
                    <hr>
                    <div id="creditos_total">
                        <table>
                            <thead>
                                <tr>
                                    <th>Categoria</th>
                                    <th>Créd. Aula</th>
                                    <th>Créd. Trabalho</th>
                                    <th>Total</th>
                                    <th>Porcentagem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="cursadas">
                                    <td>Cursadas</td>
                                    <td id="ca_cursadas">0</td>
                                    <td id="ct_cursadas">0</td>
                                    <td id="t_cursadas">0</td>
                                    <td id="p_cursadas">0%</td>
                                </tr>
                                <tr class="cursando">
                                    <td>Cursando</td>
                                    <td id="ca_cursando">0</td>
                                    <td id="ct_cursando">0</td>
                                    <td id="t_cursando">0</td>
                                    <td id="p_cursando">0%</td>
                                </tr>
                                <tr class="a_cursar">
                                    <td>A Cursar</td>
                                    <td id="ca_a_cursar">0</td>
                                    <td id="ct_a_cursar">0</td>
                                    <td id="t_a_cursar">0</td>
                                    <td id="p_a_cursar">0%</td>
                                </tr>
                                <tr class="eletivas">
                                    <td>Eletivas</td>
                                    <td id="ca_eletivas">0</td>
                                    <td id="ct_eletivas">0</td>
                                    <td id="t_eletivas">0</td>
                                    <td id="p_eletivas">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
                document.body.appendChild(container);
    
                // Variáveis de controle
                let creditos = {
                    cursadas: { aula: 0, trabalho: 0 },
                    cursando: { aula: 0, trabalho: 0 },
                    a_cursar: { aula: 0, trabalho: 0 },
                    eletivas: { aula: 0, trabalho: 0 }
                };
    
                let totalCreditosManual = { aula: 0, trabalho: 0 };
                let manualCounting = false;
    
                // Função para calcular créditos automaticamente
                async function calcularCreditosComDelay() {
                    let disciplinas = Array.from(document.querySelectorAll("#grade_curricular td[role='gridcell']"))
                    .filter(celula => celula.textContent.trim() !== "");
                    let disciplinasProcessadas = new Set();
                    
                    let total = {
                        cursadas: 0,
                        cursando: 0,
                        a_cursar: 0,
                        eletivas: 0
                    };

                    for (let i = 0; i < disciplinas.length; i++) {
                        let celula = disciplinas[i];
                        let bgColor = window.getComputedStyle(celula).backgroundColor;

                        celula.click();
                        await new Promise(resolve => setTimeout(resolve, 150));

                        let codigoDisciplina = document.querySelector("#div_disciplina .coddis")?.textContent.trim() || "000000";
                        let creditosAula = parseInt(document.querySelector("#div_disciplina .creaul")?.textContent.trim() || "0");
                        let creditosTrabalho = parseInt(document.querySelector("#div_disciplina .cretrb")?.textContent.trim() || "0");

                        let categoria;
                        if (bgColor === "rgb(0, 192, 0)") categoria = "cursadas";
                        else if (bgColor === "rgb(255, 255, 128)") categoria = "cursando";
                        else if (bgColor === "rgb(255, 160, 96)") categoria = "a_cursar";
                        else if (bgColor === "rgb(192, 192, 192)") categoria = "eletivas";
                        else continue;

                        if (!disciplinasProcessadas.has(codigoDisciplina)) {
                            creditos[categoria].aula += creditosAula;
                            creditos[categoria].trabalho += creditosTrabalho;
                            disciplinasProcessadas.add(codigoDisciplina);

                            document.getElementById(`ca_${categoria}`).textContent = creditos[categoria].aula;
                            document.getElementById(`ct_${categoria}`).textContent = creditos[categoria].trabalho;
                            total[categoria] = creditos[categoria].aula + creditos[categoria].trabalho
                            document.getElementById(`t_${categoria}`).textContent = total[categoria];
                        }
                    }
                    let creditosTotais = total.cursadas + total.cursando + total.a_cursar;
                    console.log(creditosTotais);
                    document.getElementById(`p_cursadas`).textContent = (total.cursadas / creditosTotais * 100).toFixed(2) + "%";
                    document.getElementById(`p_cursando`).textContent = (total.cursando / creditosTotais * 100).toFixed(2) + "%";
                    document.getElementById(`p_a_cursar`).textContent = (total.a_cursar / creditosTotais * 100).toFixed(2) + "%";
                }
    
                // Contagem manual ao clicar nas disciplinas
                document.querySelectorAll("#grade_curricular td[role='gridcell']").forEach(celula => {
                    celula.addEventListener("click", function() {
                        if (!manualCounting) return;
    
                        setTimeout(() => {
                            let creditosAula = parseInt(document.querySelector("#div_disciplina .creaul")?.textContent.trim() || "0");
                            let creditosTrabalho = parseInt(document.querySelector("#div_disciplina .cretrb")?.textContent.trim() || "0");
    
                            totalCreditosManual.aula += creditosAula;
                            totalCreditosManual.trabalho += creditosTrabalho;
    
                            document.getElementById("manual_aula").textContent = totalCreditosManual.aula;
                            document.getElementById("manual_trabalho").textContent = totalCreditosManual.trabalho;
                            document.getElementById("manual_total").textContent = totalCreditosManual.aula + totalCreditosManual.trabalho;
                        }, 5);
                    });
                });
    
                // Botões
                document.getElementById("iniciarCalculo").addEventListener("click", calcularCreditosComDelay);
                document.getElementById("limparCalculo").addEventListener("click", () => {
                    Object.keys(creditos).forEach(categoria => {
                        creditos[categoria].aula = 0;
                        creditos[categoria].trabalho = 0;
                        document.getElementById(`ca_${categoria}`).textContent = "0";
                        document.getElementById(`ct_${categoria}`).textContent = "0";
                        document.getElementById(`t_${categoria}`).textContent = "0";
                    });
                });
                document.getElementById("iniciarManual").addEventListener("click", () => {
                    manualCounting = true;
                    document.getElementById("manualCountingStatus").innerHTML = "Habilitada";
                    document.getElementById("manualCountingStatus").classList.add("habilitada");
                    document.getElementById("manualCountingStatus").classList.remove("desabilitada");
                });
                document.getElementById("pararManual").addEventListener("click", () => {
                    manualCounting = false;
                    document.getElementById("manualCountingStatus").innerHTML = "Desabilitada";
                    document.getElementById("manualCountingStatus").classList.add("desabilitada");
                    document.getElementById("manualCountingStatus").classList.remove("habilitada");
                });
                document.getElementById("limparManual").addEventListener("click", () => {
                    totalCreditosManual = { aula: 0, trabalho: 0 };
                    document.getElementById("manual_aula").textContent = "0";
                    document.getElementById("manual_trabalho").textContent = "0";
                    document.getElementById("manual_total").textContent = "0";
                });
    
            }, 2000);
    
        }
    } else if (urlAtual.startsWith("gradeHoraria", 37)){
        funcaoAtual = "gradeHoraria";
        alert(funcaoAtual);
    }







})();