'use client';
import { useState } from "react";
import styles from './page.module.css';
import SimpleLayout from "../layouts/SimpleLayout";
import { useRouter } from "next/navigation";

export default function SolicitarAtendimento() {
  const [descricao, setDescricao] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [idDocumentacao, setIdDocumentacao] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!descricao || !classificacao || !idDocumentacao) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      descricao,
      classificacao,
      id_documentacao: parseInt(idDocumentacao),
    };

    try {
      const response = await fetch('https://amaviapi.dev.vilhena.ifro.edu.br/api/requerimentos/solicitacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // <-- importante para enviar cookies
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 201) {
        setSuccess(data.message || 'Solicitação cadastrada com sucesso!');
        setDescricao('');
        setClassificacao('');
        setIdDocumentacao('');
      } else {
        setError(data.message || 'Erro ao cadastrar solicitação.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      console.error(err);
    }
  };

  const handleVerHistorico = () => {
    router.push('Solicitar-Atendimento/historico-atendimentos');
  };

  return (
    <SimpleLayout>
      <h1 className={styles.title}>REQUERIMENTO/SOLICITAR ATENDIMENTO</h1>
      <div className={styles.formContainer}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="descricao" className={styles.label}>Descrição:</label>
          <textarea
            id="descricao"
            name="descricao"
            className={styles.textarea}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          ></textarea>

          <label htmlFor="classificacao" className={styles.smallLabel}>Classificação:</label>
          <select
            id="classificacao"
            name="classificacao"
            className={styles.select}
            value={classificacao}
            onChange={(e) => setClassificacao(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="Urgente">Urgente</option>
            <option value="Normal">Normal</option>
          </select>

          <label htmlFor="idDocumentacao" className={styles.smallLabel}>Anexar documento:</label>
          <select
            id="idDocumentacao"
            name="idDocumentacao"
            className={styles.select}
            value={idDocumentacao}
            onChange={(e) => setIdDocumentacao(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="1">Documento 1</option>
            <option value="2">Documento 2</option>
          </select>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.button}>ENVIAR</button>
            <button type="button" className={styles.secondaryButton} onClick={handleVerHistorico}>
              VER HISTÓRICO
            </button>
          </div>
        </form>
      </div>
    </SimpleLayout>
  );
}
