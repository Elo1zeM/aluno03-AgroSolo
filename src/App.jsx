import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import './App.css';

function App() {
  const [profundidade, setProfundidade] = useState('');
  const [talhao, setTalhao] = useState('');
  const [cultura, setCultura] = useState('');
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [etiqueta, setEtiqueta] = useState(null);


async function capturarLocalizacao() {
  setCarregando(true);
  setErro('');
  setEtiqueta(null);

  try {
    let coords;

    if (Capacitor.isNativePlatform()) {
      // GPS nativo no Android
      let permissao = await Geolocation.checkPermissions();

      if (permissao.location !== 'granted') {
        permissao = await Geolocation.requestPermissions();
      }

      if (permissao.location !== 'granted') {
        throw new Error('PERMISSAO_NEGADA');
      }

      const posicao = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });

      coords = posicao.coords;
    } else {
      // GPS do navegador durante o desenvolvimento
      if (!navigator.geolocation) {
        throw new Error('GPS_NAO_SUPORTADO');
      }

      coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (posicao) => resolve(posicao.coords),
          (erro) => reject(erro),
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          }
        );
      });
    }

    setLocalizacao({
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude,
      precisao: coords.accuracy,
    });
  } catch (e) {
    if (
      e.message === 'PERMISSAO_NEGADA' ||
      e.code === 1
    ) {
      setErro(
        'Permissão de localização negada. Autorize o acesso ao GPS nas configurações do navegador ou dispositivo.'
      );
    } else if (
      e.message === 'GPS_NAO_SUPORTADO' ||
      e.code === 2
    ) {
      setErro(
        'Não foi possível obter a localização. Verifique se o GPS está disponível e ativado.'
      );
    } else if (e.code === 3) {
      setErro(
        'A localização demorou demais. Tente novamente em uma área aberta.'
      );
    } else {
      setErro(
        e.message || 'Não foi possível obter a localização. Tente novamente.'
      );
    }
  } finally {
    setCarregando(false);
  }
}

  function gerarEtiqueta(event) {
    event.preventDefault();
    setErro('');

    if (!profundidade || Number(profundidade) <= 0) {
      setErro('Informe uma profundidade válida, em centímetros.');
      return;
    }

    if (!localizacao) {
      setErro('Capture a localização GPS antes de gerar a etiqueta.');
      return;
    }

    const codigo = `AS-${Date.now().toString().slice(-7)}`;

    setEtiqueta({
      codigo,
      profundidade: Number(profundidade),
      talhao: talhao.trim() || 'Talhão não informado',
      cultura: cultura || 'Não informada',
      data: new Date().toLocaleString('pt-BR'),
      ...localizacao,
    });
  }

  const linkMapa = localizacao
    ? `https://www.google.com/maps?q=${localizacao.latitude},${localizacao.longitude}`
    : '';

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="AgroSolo início">
          <span className="brand-icon">A<span>+</span></span>
          <span className="brand-name">agro<span>solo</span><small>TECNOLOGIA DE PRECISÃO</small></span>
        </a>
        <div className="status-pill"><span /> CAMPO CONECTADO</div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <span className="eyebrow"><span className="eyebrow-line" /> AGRICULTURA INTELIGENTE</span>
          <h1>Conheça o solo.<br /><em>Transforme</em> o futuro.</h1>
          <p>Registre amostras com precisão geográfica e leve informações confiáveis do campo para o laboratório.</p>
          <div className="hero-tags">
            <span>⌖ Georreferenciamento</span>
            <span>✳ Análise de solo</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="earth-symbol">✳</div>
          <div className="floating-coordinate"><span>LAT / LONG</span><strong>Precisão em cada ponto.</strong><small>AGROSOLO • GPS</small></div>
          <div className="art-label">01 — DO CAMPO AO LABORATÓRIO</div>
        </div>
      </section>

      <section className="stats-row" aria-label="Recursos do AgroSolo">
        <div className="stat-item"><span className="stat-icon">⌖</span><div><strong>GPS preciso</strong><small>Coordenadas geográficas</small></div></div>
        <div className="stat-item"><span className="stat-icon">↟</span><div><strong>Dados de altitude</strong><small>Informações do terreno</small></div></div>
        <div className="stat-item"><span className="stat-icon">▤</span><div><strong>Etiqueta digital</strong><small>Identificação da amostra</small></div></div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div><span className="section-kicker">CENTRAL DE COLETA / 01</span><h2>Nova amostra de solo</h2><p>Preencha os dados da coleta e registre o ponto exato no campo.</p></div>
          <div className="step-indicator"><span>01</span><i /> <span>02</span><i /> <span>03</span></div>
        </div>

        <div className="form-grid">
          <form className="panel sample-form" onSubmit={gerarEtiqueta}>
            <div className="panel-title"><span className="panel-number">01</span><div><h3>Dados da coleta</h3><p>Identificação da amostra</p></div></div>

            <label htmlFor="talhao">Nome do talhão <span>OPCIONAL</span></label>
            <input id="talhao" value={talhao} onChange={(e) => setTalhao(e.target.value)} placeholder="Ex.: Talhão Norte — Área 04" />

            <label htmlFor="cultura">Cultura cultivada</label>
            <select id="cultura" value={cultura} onChange={(e) => setCultura(e.target.value)}>
              <option value="">Selecione a cultura</option>
              <option>Soja</option>
              <option>Milho</option>
              <option>Café</option>
              <option>Cana-de-açúcar</option>
              <option>Algodão</option>
              <option>Trigo</option>
              <option>Pastagem</option>
              <option>Outra</option>
            </select>

            <label htmlFor="profundidade">Profundidade da amostra <span>OBRIGATÓRIO</span></label>
            <div className="depth-input"><input id="profundidade" type="number" min="1" max="500" step="1" value={profundidade} onChange={(e) => setProfundidade(e.target.value)} placeholder="Ex.: 20" required /><span>cm</span></div>
            <small className="field-hint">Informe a profundidade em centímetros.</small>

            <button className="gps-button" type="button" onClick={capturarLocalizacao} disabled={carregando}>
              {carregando ? <><span className="spinner" /> Capturando localização...</> : <><span className="button-gps-icon">⌖</span> {localizacao ? 'Atualizar localização GPS' : 'Capturar localização GPS'} <span className="button-arrow">↗</span></>}
            </button>

            {erro && <div className="error-message" role="alert">⚠ {erro}</div>}

            <button className="submit-button" type="submit">Gerar etiqueta da amostra <span>→</span></button>
            <p className="privacy-note">⌑ Os dados da coleta são preparados neste dispositivo.</p>
          </form>

          <div className="right-column">
            <section className="panel location-panel">
              <div className="panel-title"><span className="panel-number">02</span><div><h3>Localização do ponto</h3><p>Coordenadas registradas por GPS</p></div><span className={`gps-status ${localizacao ? 'is-active' : ''}`}><span />{localizacao ? 'CAPTURADO' : 'AGUARDANDO'}</span></div>

              {localizacao ? (
                <>
                  <div className="coordinates">
                    <div><span>LATITUDE</span><strong>{localizacao.latitude.toFixed(6)}°</strong></div>
                    <div><span>LONGITUDE</span><strong>{localizacao.longitude.toFixed(6)}°</strong></div>
                  </div>
                  <div className="location-details">
                    <div><span>⌖</span><div><small>Precisão estimada</small><strong>± {Math.round(localizacao.precisao)} metros</strong></div></div>
                    <div><span>↟</span><div><small>Altitude</small><strong>{localizacao.altitude == null ? 'Não disponibilizada pelo GPS' : `${localizacao.altitude.toFixed(1)} m`}</strong></div></div>
                  </div>
                  <a className="map-link" href={linkMapa} target="_blank" rel="noreferrer">Abrir ponto no Google Maps <span>↗</span></a>
                </>
              ) : (
                <div className="location-empty">
                  <div className="radar"><span>⌖</span><i /><b /></div>
                  <strong>Aguardando sinal do GPS</strong>
                  <p>Toque em “Capturar localização GPS” para registrar latitude, longitude, altitude e precisão.</p>
                </div>
              )}
            </section>

            <section className="tip-card">
              <div className="tip-icon">✳</div><div><span>BOA PRÁTICA DE CAMPO</span><h3>Precisão começa na coleta.</h3><p>Para obter melhores resultados, realize a captura em uma área aberta, com o GPS ativado.</p></div>
            </section>
          </div>
        </div>

        {etiqueta && (
          <section className="panel label-panel" aria-live="polite">
            <div className="label-top"><div><span className="section-kicker">REGISTRO GERADO / 03</span><h2>Etiqueta digital da amostra</h2></div><span className="label-check">✓ REGISTRADA</span></div>
            <div className="digital-label">
              <div className="label-brand"><span className="brand-icon">A<span>+</span></span><span className="brand-name">agro<span>solo</span><small>IDENTIFICAÇÃO DE AMOSTRA</small></span></div>
              <div className="label-code">{etiqueta.codigo}</div>
              <div className="label-fields">
                <div><small>TALHÃO</small><strong>{etiqueta.talhao}</strong></div>
                <div><small>CULTURA</small><strong>{etiqueta.cultura}</strong></div>
                <div><small>PROFUNDIDADE</small><strong>{etiqueta.profundidade} cm</strong></div>
                <div><small>DATA DA COLETA</small><strong>{etiqueta.data}</strong></div>
                <div><small>LATITUDE</small><strong>{etiqueta.latitude.toFixed(6)}°</strong></div>
                <div><small>LONGITUDE</small><strong>{etiqueta.longitude.toFixed(6)}°</strong></div>
                <div><small>ALTITUDE</small><strong>{etiqueta.altitude == null ? 'Não disponível' : `${etiqueta.altitude.toFixed(1)} m`}</strong></div>
                <div><small>PRECISÃO GPS</small><strong>± {Math.round(etiqueta.precisao)} m</strong></div>
              </div>
              <a className="map-link" href={`https://www.google.com/maps?q=${etiqueta.latitude},${etiqueta.longitude}`} target="_blank" rel="noreferrer">Visualizar ponto da amostra no mapa ↗</a>
            </div>
            <button className="new-sample-button" onClick={() => { setEtiqueta(null); setProfundidade(''); setTalhao(''); setCultura(''); setLocalizacao(null); setErro(''); }}>+ Registrar nova amostra</button>
          </section>
        )}
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#inicio"><span className="brand-icon">A<span>+</span></span><span className="brand-name">agro<span>solo</span><small>TECNOLOGIA DE PRECISÃO</small></span></a><span>TECNOLOGIA A FAVOR DA TERRA.</span><small>AGROSOLO © {new Date().getFullYear()}</small></footer>
    </main>
  );
}

export default App;
