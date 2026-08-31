import type { Modelo, Producto, RolTarea } from "./modelo";

// Rol names are referenced from both Fase.roles and Tarea.roles, so they live in
// one place: a typo here would leave a Tarea pointing at a Rol the Fase lacks.
const GP = "Gerente de proyecto";
const ED = "Experto del dominio (caficultor)";
const ISV = "Ingeniero de seguridad de vuelo";
const ID = "Ingeniero de datos";
const ISA = "Ingeniero de software de adaptación";
const QA = "QA de software";
// El equipo de hardware. El sistema es ciberfísico: los sensores, los actuadores
// y el enlace con el dron son trabajo de ingeniería propio, no un detalle del
// software. Los nombres son los del paper. Ver ADR-0016.
const IP = "Ingeniero de plataforma";
const IM = "Ingeniero de mecatrónica";

const ejecuta = (...roles: string[]): RolTarea[] =>
  roles.map((rol) => ({ rol, papel: "perform" as const }));
const asiste = (...roles: string[]): RolTarea[] =>
  roles.map((rol) => ({ rol, papel: "assist" as const }));

const wp = (texto: string): Producto => ({ texto, icono: "workProduct" });
const guia = (texto: string): Producto => ({ texto, icono: "metric" });
const tool = (texto: string): Producto => ({ texto, icono: "tool" });

// Productos de Trabajo shared between Fases keep the same text and the same SPEM
// type on both sides of the hand-off, so the Flujo of two Fases lines up.
const CONOCIMIENTO: Producto = {
  texto: "Conocimiento del experto del dominio (caficultor)",
  icono: "roleUse",
};
const VISION = guia("Visión del producto");
const MAPA_RUTA = guia("Mapa de ruta de los cinco incrementos");
const BACKLOG = wp("Backlog compartido priorizado");
const POLITICA_REL = guia("Política de lanzamientos");
const CONSTITUCION = wp("Constitution.md");
const POLITICAS = guia("Políticas y límites de operación");
const REGLAS = guia("Reglas de negocio");
const CONTRATOS_2 = wp("Contratos globales y de integración entre dominios");
const PLANOS = wp("Planos del terreno");
const NORMATIVIDAD = guia("Normatividad vigente");
const SPECS = wp("spec.md, plan.md, task.md");
const ENTORNOS = tool("Entornos de simulación SIL y HIL configurados");
const GEMELO_SUELO = tool("Gemelo digital del suelo y del cultivo");
const GEMELO_DRON = tool("Gemelo digital del dron");
const ARQUITECTURA = wp("Modelo de arquitectura del sistema");
const LOGICA = wp("Especificaciones de la lógica de adaptación");
const PROTOTIPO = wp("Prototipo vertical funcional");
const INFORMES = wp("Informes de validación de control");
const CERTIFICACION = guia("Certificación de rutas de vuelo");
const PIPELINE = tool("Pipeline de CI/CD base");
const ESQUEMATICOS = wp("Esquemáticos y lista de materiales");
const BANCO_HW = tool("Banco de pruebas de hardware");
const BANCO_HIL = tool("Banco HIL con hardware real");
const LECCIONES = wp("Lecciones y ajustes al backlog");
const AJUSTES_PROCESO = wp("Ajustes al proceso del equipo");
const NOTAS_RELEASE = wp("Notas del lanzamiento");
const RED_SENSORES = wp("Red de sensores instalada");
const FIRMWARE = wp("Firmware de sensores y actuadores");

/**
 * The five Fases of the *Modelo de procesos* document.
 *
 * The per-Tarea split of Roles and Productos de Trabajo is NOT in the source
 * document, which lists them per Fase in bulk. It is inferred from each Tarea's
 * name and description and is the editor's contribution, to be reviewed Fase by
 * Fase before any figure is pasted into the document. Ver ADR-0006.
 */
export const seed = (): Modelo => ({
  version: 3,
  fases: [
    {
      id: "fase-0",
      nombre: "Fase 0: Visión y planificación del producto",
      objetivo:
        "Definir qué valor se entrega y en qué orden, antes de fijar ningún contrato técnico.",
      roles: [GP, ED, QA, ISA, IP],
      tareas: [
        {
          id: "t0-1",
          icono: "task",
          nombre: "Redactar la visión del producto",
          descripcion:
            "Fijar las metas agronómicas del sistema: la cobertura de riego esperada y el ahorro de agua que se busca.",
          roles: [...ejecuta(GP), ...asiste(ED)],
          entrada: [CONOCIMIENTO],
          salida: [VISION],
        },
        {
          id: "t0-2",
          icono: "task",
          nombre: "Definir el mapa de ruta de los cinco incrementos",
          descripcion:
            "Ordenar monitoreo, dron, riego, clima y multi dron, y justificar por qué ese orden entrega valor de forma progresiva.",
          roles: [...ejecuta(GP), ...asiste(ISA, IP)],
          entrada: [VISION],
          salida: [MAPA_RUTA],
        },
        {
          id: "t0-3",
          icono: "task",
          nombre: "Levantar la primera versión del backlog compartido",
          descripcion:
            "La lista priorizada de necesidades que el ciclo de crecimiento irá resolviendo incremento a incremento.",
          roles: [...ejecuta(GP), ...asiste(ED)],
          entrada: [MAPA_RUTA],
          salida: [BACKLOG],
        },
        {
          id: "t0-4",
          icono: "task",
          nombre: "Establecer la política de lanzamientos",
          descripcion:
            "Cada cuánto se publica una versión, qué debe cumplir un incremento para publicarse y cómo se nombra cada lanzamiento.",
          roles: [...ejecuta(GP), ...asiste(QA)],
          entrada: [MAPA_RUTA],
          salida: [POLITICA_REL],
        },
      ],
      entrada: [CONOCIMIENTO],
      salida: [VISION, MAPA_RUTA, BACKLOG, POLITICA_REL],
    },
    {
      id: "fase-1",
      nombre: "Fase 1: Especificación global de nivel cero",
      objetivo: "Fijar el marco de gobernanza, límites y contratos iniciales.",
      roles: [GP, ED, ISV, ID],
      tareas: [
        {
          id: "t1-1",
          icono: "task",
          nombre: "Definir Constitución, reglas y contratos globales",
          descripcion:
            "Redactar el Constitution.md estableciendo restricciones y principios no negociables.",
          roles: [...ejecuta(GP), ...asiste(ED, ID)],
          entrada: [NORMATIVIDAD, VISION],
          salida: [
            CONSTITUCION,
            wp("Contratos globales"),
            wp("Contratos de integración entre dominios"),
          ],
        },
        {
          id: "t1-2",
          icono: "task",
          nombre: "Capturar y modelar el conocimiento inicial del dominio",
          descripcion:
            "Consolidar junto al Experto del Dominio (caficultor) las reglas agrónomas generales que regirán el sistema.",
          roles: [...ejecuta(ED), ...asiste(ID)],
          entrada: [CONOCIMIENTO, PLANOS],
          salida: [REGLAS],
        },
        {
          id: "t1-3",
          icono: "task",
          nombre: "Definir restricciones de seguridad de vuelo y normativas",
          descripcion:
            "Establecer el marco legal y físico preliminar para la operación de drones en la zona.",
          roles: [...ejecuta(ISV), ...asiste(GP)],
          entrada: [NORMATIVIDAD, PLANOS],
          salida: [POLITICAS],
        },
      ],
      entrada: [CONOCIMIENTO, PLANOS, NORMATIVIDAD, VISION],
      salida: [
        CONSTITUCION,
        POLITICAS,
        REGLAS,
        wp("Contratos globales"),
        wp("Contratos de integración entre dominios"),
      ],
    },
    {
      id: "fase-2",
      nombre: "Fase 2: Descomposición en dominios",
      objetivo:
        "Fragmentar el sistema, preparar los entornos de simulación y traducir esquemas.",
      roles: [GP, ID, ISA, IP, IM],
      tareas: [
        {
          id: "t2-1",
          icono: "task",
          nombre: "Identificar subdominios y definir subcontratos internos",
          descripcion:
            "Delimitar responsabilidades entre datos, plataforma, adaptación y vuelo.",
          roles: [...ejecuta(GP), ...asiste(ISA)],
          entrada: [CONSTITUCION, CONTRATOS_2],
          salida: [],
        },
        {
          id: "t2-2",
          icono: "task",
          nombre: "Seleccionar escenario piloto",
          descripcion:
            "Definir el terreno o lote específico para las pruebas iniciales.",
          roles: [...ejecuta(GP), ...asiste(ID)],
          entrada: [PLANOS, REGLAS],
          salida: [],
        },
        {
          id: "t2-3",
          icono: "task",
          nombre: "Traducir los contratos a spec.md, plan.md y task.md",
          descripcion:
            "El equipo de software baja los contratos conceptuales a esquemas de datos y protocolos concretos.",
          roles: [...ejecuta(ID, ISA), ...asiste(IP)],
          entrada: [CONTRATOS_2, POLITICAS],
          salida: [SPECS],
        },
        {
          id: "t2-4",
          icono: "task",
          nombre: "Diseñar el modelo de arquitectura preliminar",
          descripcion:
            "El equipo de hardware define cómo se interconectan sensores, drones y servidor; el software de adaptación asiste con lo que el bucle MAPE-K necesita.",
          roles: [...ejecuta(IP, IM), ...asiste(ISA)],
          entrada: [CONTRATOS_2],
          salida: [ARQUITECTURA],
        },
        {
          id: "t2-5",
          icono: "activity",
          nombre: "Configurar los entornos SIL, HIL y los gemelos digitales",
          descripcion:
            "Punto de sincronización de los dos equipos. El gemelo del suelo y del cultivo es del ingeniero de datos; el del dron, del equipo de hardware.",
          roles: [...ejecuta(ID, IP), ...asiste(ISA, IM)],
          entrada: [SPECS, ARQUITECTURA],
          salida: [ENTORNOS, GEMELO_SUELO, GEMELO_DRON],
        },
        {
          id: "t2-6",
          icono: "task",
          nombre: "Planificar la estrategia de calibración de sensores y actuadores",
          descripcion:
            "Definir los parámetros base que el equipo de hardware usará para calibrar en campo.",
          roles: [...ejecuta(IM, IP), ...asiste(ISA)],
          entrada: [],
          salida: [LOGICA],
        },
        {
          id: "t2-7",
          icono: "task",
          nombre: "Diseñar la electrónica de sensores, actuadores y enlace del dron",
          descripcion:
            "Esquemáticos, selección de componentes y banco de pruebas del hardware que el software va a comandar.",
          roles: [...ejecuta(IP), ...asiste(IM)],
          entrada: [POLITICAS, PLANOS],
          salida: [ESQUEMATICOS, BANCO_HW],
        },
      ],
      entrada: [PLANOS, CONSTITUCION, POLITICAS, REGLAS, CONTRATOS_2],
      salida: [
        SPECS,
        ENTORNOS,
        GEMELO_SUELO,
        GEMELO_DRON,
        ARQUITECTURA,
        LOGICA,
        ESQUEMATICOS,
        BANCO_HW,
      ],
    },
    {
      id: "fase-3",
      nombre: "Fase 3: Esqueleto funcional mínimo",
      objetivo:
        "Construir el prototipo vertical: unir extremo a extremo una traza mínima del sistema.",
      roles: [ISA, ID, QA, GP, ED, ISV, IM, IP],
      tareas: [
        {
          id: "t3-1",
          icono: "task",
          nombre: "Construir prototipo vertical",
          descripcion:
            "Integrar una primera versión conectando datos de sensores, una regla básica del MAPE-K y una acción simulada.",
          roles: [...ejecuta(ISA), ...asiste(ID)],
          entrada: [SPECS, ARQUITECTURA, LOGICA],
          salida: [PROTOTIPO],
        },
        {
          id: "t3-2",
          icono: "milestone",
          nombre: "Validar el prototipo en entorno simulado (SIL/HIL)",
          descripcion:
            "Probar la traza mínima para verificar que la lógica de control responde antes de tocar hardware real.",
          roles: [...ejecuta(QA), ...asiste(IM, IP)],
          entrada: [ENTORNOS, GEMELO_SUELO],
          salida: [INFORMES],
        },
        {
          id: "t3-3",
          icono: "task",
          nombre: "Establecer el pipeline de CI/CD base",
          descripcion:
            "Automatizar el empaquetado inicial de las especificaciones y el código del prototipo.",
          roles: [...ejecuta(ISA), ...asiste(QA)],
          entrada: [],
          salida: [PIPELINE],
        },
        {
          id: "t3-4",
          icono: "milestone",
          nombre: "Validar reglas de negocio y condiciones agronómicas",
          roles: [...ejecuta(ED), ...asiste(GP, QA)],
          entrada: [],
          salida: [],
        },
        {
          id: "t3-5",
          icono: "task",
          nombre: "Integrar el hardware real en el banco HIL",
          descripcion:
            "Montar sensores y actuadores reales contra la lógica de control: donde el equipo de hardware y el de software se encuentran.",
          roles: [...ejecuta(IM, IP), ...asiste(ISA)],
          entrada: [ENTORNOS, ESQUEMATICOS, BANCO_HW, GEMELO_DRON],
          salida: [BANCO_HIL],
        },
        {
          id: "t3-6",
          icono: "milestone",
          nombre: "Certificar las rutas de vuelo contra la normativa",
          descripcion:
            "La frontera del punto de control: calidad valida el comportamiento del sistema, seguridad de vuelo certifica que las rutas cumplen la ley.",
          roles: [...ejecuta(ISV), ...asiste(QA)],
          entrada: [POLITICAS, NORMATIVIDAD],
          salida: [CERTIFICACION],
        },
      ],
      entrada: [
        SPECS,
        ENTORNOS,
        GEMELO_SUELO,
        GEMELO_DRON,
        ARQUITECTURA,
        LOGICA,
        ESQUEMATICOS,
        BANCO_HW,
      ],
      salida: [PROTOTIPO, INFORMES, PIPELINE, BANCO_HIL, CERTIFICACION],
    },
    {
      id: "fase-4",
      nombre: "Fase 4: Ciclo de crecimiento",
      objetivo:
        "Escalar el sistema mediante desarrollo paralelo, integración continua y validación en el cultivo.",
      roles: [ISA, ID, QA, GP, ED, IM, IP],
      tareas: [
        {
          id: "t4-1",
          icono: "activity",
          nombre: "Sincronización inter dominio",
          descripcion:
            "Acordar, contra el backlog y el mapa de ruta de la Fase 0, qué entregables coordinados produce el incremento.",
          roles: [...ejecuta(GP), ...asiste(ISA)],
          entrada: [INFORMES, BACKLOG, MAPA_RUTA],
          salida: [wp("Archivos spec.md / task.md")],
        },
        {
          id: "t4-2",
          icono: "activity",
          nombre: "Construcción en paralelo (contrato primero)",
          descripcion:
            "Las dos ramas avanzan a su propio ritmo: el software sobre los gemelos digitales, el hardware sobre el banco.",
          // The five successive increments of the Fase's Entrada are consumed here.
          roles: [...ejecuta(ISA, ID, IP, IM)],
          entrada: [
            PROTOTIPO,
            tool("Monitoreo y operación del dron"),
            tool("Sistema de riego y variables climáticas"),
            tool("Coordinación múltiple de drones"),
          ],
          // La plataforma y la mecatrónica entregan lo suyo en el mismo incremento.
          salida: [wp("Código fuente"), wp("Releases de software"), RED_SENSORES, FIRMWARE],
        },
        {
          id: "t4-3",
          icono: "process",
          nombre: "Verificación e integración continua",
          descripcion:
            "Ejecución de pruebas automatizadas mediante CI/CD, SIL/HIL y gemelos digitales.",
          roles: [...ejecuta(QA), ...asiste(IM, IP)],
          entrada: [PIPELINE, BANCO_HIL],
          salida: [tool("Pipeline de CI/CD ejecutado"), tool("Entornos SIL/HIL validados")],
        },
        {
          id: "t4-4",
          icono: "milestone",
          nombre: "Despliegue en campo",
          descripcion:
            "Llevar los releases al terreno real e instalar y calibrar los dispositivos físicos del sistema.",
          roles: [...ejecuta(IM, IP), ...asiste(ISA)],
          entrada: [],
          salida: [wp("Paquete de calibración de sensores y actuadores")],
        },
        {
          id: "t4-5",
          icono: "milestone",
          nombre: "Review del incremento con el caficultor",
          descripcion:
            "Demostrar el incremento en su terreno y recoger lo aprendido: es lo que reordena el backlog del siguiente.",
          roles: [...ejecuta(ED), ...asiste(GP, QA)],
          entrada: [],
          salida: [LECCIONES],
        },
        {
          id: "t4-6",
          icono: "activity",
          nombre: "Retrospectiva de proceso",
          descripcion:
            "El review mira el producto; la retrospectiva mira cómo trabajó el equipo, y ajusta su forma de trabajar para el siguiente incremento.",
          roles: [...ejecuta(GP), ...asiste(QA, ISA)],
          entrada: [],
          salida: [AJUSTES_PROCESO],
        },
        {
          id: "t4-7",
          icono: "milestone",
          nombre: "Publicación del lanzamiento",
          descripcion:
            "Un lanzamiento por incremento, según la política de la Fase 0: número de versión y notas con los cambios incluidos.",
          roles: [...ejecuta(GP), ...asiste(QA)],
          entrada: [POLITICA_REL],
          salida: [NOTAS_RELEASE],
        },
        {
          id: "t4-8",
          icono: "task",
          nombre: "Elaboración y actualización del manual de operación",
          descripcion:
            "Traducir los cambios técnicos del lanzamiento en guías claras para el caficultor.",
          roles: [...ejecuta(ED), ...asiste(ISA)],
          entrada: [NOTAS_RELEASE],
          salida: [guia("Manual de operación actualizado")],
        },
        {
          id: "t4-9",
          icono: "milestone",
          nombre: "Auditoría de cumplimiento de las especificaciones",
          descripcion:
            "Revisar que el incremento no rompa la Constitution.md de la Fase 1 ni se salga del plan.md acordado en la Fase 2.",
          roles: [...ejecuta(GP), ...asiste(QA)],
          entrada: [CONSTITUCION, SPECS],
          salida: [],
        },
      ],
      entrada: [
        PROTOTIPO,
        INFORMES,
        PIPELINE,
        BANCO_HIL,
        BACKLOG,
        MAPA_RUTA,
        POLITICA_REL,
        tool("Monitoreo y operación del dron"),
        tool("Sistema de riego y variables climáticas"),
        tool("Coordinación múltiple de drones"),
      ],
      salida: [
        wp("Código fuente"),
        wp("Archivos spec.md / task.md"),
        tool("Pipeline de CI/CD ejecutado"),
        tool("Entornos SIL/HIL validados"),
        wp("Paquete de calibración de sensores y actuadores"),
        wp("Releases de software"),
        RED_SENSORES,
        FIRMWARE,
        NOTAS_RELEASE,
        guia("Manual de operación actualizado"),
        LECCIONES,
        AJUSTES_PROCESO,
      ],
    },
  ],
});
