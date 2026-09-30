# Álbum Player Interativo - Alice in Chains — Dirt

Este projeto é um player/encarte digital premium, desenvolvido com foco na experiência mobile (Safari/iOS) e na reprodução de áudio estática (GitHub Pages).

## Estrutura do Projeto

```
album-player/
│
├── index.html       # Estrutura principal da página
│
├── css/
│   └── style.css    # Estilos (mobile-first, variáveis CSS, estética premium)
│
├── js/
│   ├── app.js       # Ponto de entrada e inicialização
│   ├── player.js    # Lógica de controle de áudio (HTML5 Audio API)
│   └── ui.js        # Lógica de interface (DOM, modais, renderização)
│
├── data/
│   └── album.js     # ARQUIVO PRINCIPAL DE DADOS (todas as informações ficam aqui)
│
├── assets/
│   └── cover.jpg    # Capa do álbum (imagem principal e ambiental)
│
├── audio/
│   └── (seus arquivos .mp3 aqui)
│
└── README.md
```

## Como Editar os Dados

A aplicação é **totalmente orientada a dados**. Nunca edite o arquivo HTML para adicionar músicas, letras ou premiações.
Tudo deve ser alterado no arquivo `data/album.js`.

### 1. Capa do Álbum
Substitua o arquivo `assets/cover.jpg` pela capa oficial em alta resolução. O sistema automaticamente criará o fundo ambiental embaçado usando essa mesma imagem.

### 2. Informações Gerais
Abra `data/album.js` e edite os campos do objeto principal (`title`, `releaseDate`, `description`, etc).

### 3. Ficha Técnica e Premiações
- A ficha técnica está na propriedade `technicalCredits`.
- As premiações ficam no array `awards`. Deixe o array vazio `[]` se não houver dados, o sistema tratará a interface automaticamente.

### 4. Músicas (18 faixas)
Dentro de `data/album.js`, existe o array `tracks` com 18 objetos.
Para adicionar uma música:
```javascript
{
    number: 1,
    title: "Nome da Música",
    duration: "03:45",
    composers: ["Compositor 1", "Compositor 2"],
    audio: "audio/01-faixa.mp3",
    lyrics: "Letra da música aqui..."
}
```

**ARQUIVOS DE ÁUDIO:** 
Coloque os arquivos `.flac` dentro da pasta `audio/` na raiz do projeto e referencie o caminho relativo no campo `audio` de cada faixa (ex: `audio/01.flac`). Recomenda-se nomear os arquivos com o número da faixa para manter a organização (01-, 02-, etc). Como o GitHub Pages tem limite de tamanho por repositório (recomendado até ~1GB), fique atento ao tamanho total dos MP3s se o álbum for grande.

### 5. Letras Sincronizadas (formato LRC)
O campo `lyrics` aceita dois formatos:

- **Texto simples**, exibido estático (comportamento original).
- **Formato LRC**, com tags de tempo `[mm:ss.xx]` no início de cada linha. Quando o sistema detecta esse padrão, a letra é exibida linha por linha e a linha atual é destacada automaticamente conforme a música toca (efeito karaokê), com rolagem automática.

Exemplo de `lyrics` no formato LRC:
```javascript
lyrics: `[00:12.00]Primeira linha da música
[00:16.50]Segunda linha da música
[00:21.30]Terceira linha da música`
```

Você pode conseguir arquivos `.lrc` prontos em sites de letras sincronizadas, ou criar/editar manualmente. Basta colar o conteúdo do `.lrc` (mantendo as tags de tempo) direto no campo `lyrics` como uma string. Não é necessário fazer upload do arquivo `.lrc` em si — o conteúdo dele vira texto dentro do `album.js`.
