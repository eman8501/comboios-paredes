# Comboios de Paredes

Painel web responsivo para consultar chegadas e partidas na estação de Paredes.

## Funcionalidades

- Pesquisa automática da estação de Paredes.
- Chegadas e partidas separadas.
- Serviços Urbanos, Regionais, InterRegionais, Intercidades, Alfa Pendular, Internacionais e outros devolvidos pela fonte.
- Horários previstos/estimados, origem, destino, linha, atrasos e observações quando disponíveis.
- Atualização automática a cada 30 segundos.
- Interface adaptada a telemóveis.

## Executar

Requer Docker e Docker Compose:

```bash
docker compose up --build -d
```

Abrir `http://localhost:8080`.

Para alterar a porta pública, definir `WEB_PORT`, por exemplo `WEB_PORT=8088`.

## Fonte de dados

A aplicação usa o servidor REST do projeto comunitário [caiocdcs/comboios-rs](https://github.com/caiocdcs/comboios-rs), que consulta fontes da CP e da Infraestruturas de Portugal.

Endpoints utilizados:
- `GET /stations?query=Paredes`
- `GET /stations/timetable/{station_id}`

O identificador da estação é obtido por pesquisa, não está fixo no código.

**Nota:** os endpoints subjacentes da CP/IP usados pelo projeto são não oficiais e podem mudar sem aviso. A disponibilidade, os horários e as observações dependem dessas fontes. Confirmar sempre a informação nos ecrãs e avisos oficiais da estação.

## Estado

A interface e o cliente de API estão implementados. Falta executar o conjunto de serviços num alojamento com Docker, validar a resposta real da estação de Paredes em produção e publicar a aplicação com HTTPS.
