#!/usr/bin/env bash
# Gera docs/COMPILADO.md a partir dos documentos listados (ordem fixa).
# Executar na raiz do repositório: ./scripts/compile-docs.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/COMPILADO.md"
cd "$ROOT"

emit_sep() {
  echo ""
  echo "---"
  echo ""
  echo "## Fonte: $1"
  echo ""
}

rewrite_readme_root_links() {
  # README na raiz usa docs/foo.md; em docs/COMPILADO.md o caminho relativo é foo.md
  sed 's/](docs\//](/g'
}

{
  echo "# Documentação completa — Tasks POP (compilado)"
  echo ""
  echo "> **Compilado gerado em $(date -Iseconds).** A fonte canónica para edição continua a ser os ficheiros individuais em \`docs/\` e o \`README.md\` na raiz. Para regenerar: \`./scripts/compile-docs.sh\`."
  echo ""

  emit_sep "README.md (raiz do repositório)"
  rewrite_readme_root_links < README.md

  emit_sep "docs/README.md"
  cat docs/README.md

  emit_sep "docs/requisitos-e-casos-de-uso.md"
  cat docs/requisitos-e-casos-de-uso.md

  emit_sep "docs/architecture.md"
  cat docs/architecture.md

  emit_sep "docs/modelo-dados.md"
  cat docs/modelo-dados.md

  emit_sep "docs/especificacao-sistema.md"
  cat docs/especificacao-sistema.md

  emit_sep "docs/api.md"
  cat docs/api.md

  emit_sep "docs/deployment.md"
  cat docs/deployment.md

  emit_sep "docs/decisions.md"
  cat docs/decisions.md

  emit_sep "docs/PLANO_NOTIFICACOES_PUSHER.md"
  cat docs/PLANO_NOTIFICACOES_PUSHER.md

  emit_sep "CHANGELOG.md (raiz do repositório)"
  cat CHANGELOG.md

} > "$OUT"

echo "Gerado: $OUT ($(wc -l < "$OUT") linhas)"
