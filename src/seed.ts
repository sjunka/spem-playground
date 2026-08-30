import type { Modelo, Producto, RolTarea } from "./modelo";

// Rol names are referenced from both Fase.roles and Tarea.roles, so they live in
// one place: a typo here would leave a Tarea pointing at a Rol the Fase lacks.
const GP = "Gerente de proyecto";
const ED = "Experto del dominio (caficultor)";
const ISV = "Ingeniero de seguridad de vuelo";
const ID = "Ingeniero de datos";
const IP = "Ingeniero de plataforma";
const ISA = "Ingeniero de software de adaptación";
const QA = "QA de software";
// El sistema es ciberfísico: la electrónica y la integración con el dron son
// trabajo de ingeniería propio, no un detalle de la plataforma de software.
const IE = "Ingeniero electrónico";
const IM = "Ingeniero mecatrónico";

const ejecuta = (...roles: string[]): RolTarea[] =>
  roles.map((rol) => ({ rol, papel: "perform" as const }));
const asiste = (...roles: string[]): RolTarea[] =>
  roles.map((rol) => ({ rol, papel: "assist" as const }));

const wp = (texto: string): Producto => ({ texto, icono: "workProduct" });
const guia = (texto: string): Producto => ({ texto, icono: "metric" });
const tool = (texto: string): Producto => ({ texto, icono: "tool" });

// Productos de Trabajo shared between Fases keep the same text and the same SPEM
// type on both sides of the hand-off, so the Flujo of two Fases lines up.
const CONSTITUCION = wp("Constitution.md");
const POLITICAS = guia("Políticas y límites de operación");
const REGLAS = guia("Reglas de negocio");
const CONTRATOS_2 = wp("Contratos globales y de integración entre dominios");
const PLANOS = wp("Planos del terreno");
const NORMATIVIDAD = guia("Normatividad vigente");
const SPECS = wp("spec.md, plan.md, task.md");
const ENTORNOS = tool("Entornos de simulación SIL y HIL configurados");
const ARQUITECTURA = wp("Modelo de arquitectura del sistema");
const LOGICA = wp("Especificaciones de la lógica de adaptación");
const PROTOTIPO = wp("Prototipo vertical funcional");
const INFORMES = wp("Informes de validación de control");
const PIPELINE = tool("Pipeline de CI/CD base");
const ESQUEMATICOS = wp("Esquemáticos y lista de materiales");
const BANCO_HW = tool("Banco de pruebas de hardware");
const BANCO_HIL = tool("Banco HIL con hardware real");
const LECCIONES = wp("Lecciones y ajustes al backlog");

/**
 * The four Fases of the *Modelo de procesos* document.
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
          entrada: [NORMATIVIDAD],
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
          entrada: [
            { texto: "Conocimiento del experto del dominio (caficultor)", icono: "roleUse" },
            PLANOS,
          ],
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
      entrada: [
        { texto: "Conocimiento del experto del dominio (caficultor)", icono: "roleUse" },
        PLANOS,
        NORMATIVIDAD,
      ],
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
      roles: [GP, ID, IP, ISA, IE, IM],
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
          icono: "activity",
          nombre: "Traducir esquemas técnicos y disponer entornos SIL, HIL y gemelos digitales",
          descripcion:
            "Preparar la infraestructura de simulación y los archivos base (spec.md, plan.md, task.md).",
          roles: [...ejecuta(IP), ...asiste(ID)],
          entrada: [POLITICAS],
          salida: [SPECS, ENTORNOS],
        },
        {
          id: "t2-4",
          icono: "task",
          nombre: "Diseñar el modelo de arquitectura preliminar",
          descripcion:
            "Estructurar cómo se interconectarán sensores, drones y el servidor de adaptación (bucle MAPE-K).",
          roles: [...ejecuta(ISA), ...asiste(IP)],
          entrada: [CONTRATOS_2],
          salida: [ARQUITECTURA],
        },
        {
          id: "t2-5",
          icono: "task",
          nombre: "Planificar la estrategia de calibración de sensores y actuadores",
          descripcion:
            "Definir los parámetros base que requerirá el ingeniero de plataforma.",
          roles: [...ejecuta(IP), ...asiste(ISA)],
          entrada: [],
          salida: [LOGICA],
        },
        {
          id: "t2-6",
          icono: "task",
          nombre: "Diseñar la electrónica de sensores, actuadores y enlace del dron",
          descripcion:
            "Esquemáticos, selección de componentes y banco de pruebas del hardware que el software va a comandar.",
          roles: [...ejecuta(IE), ...asiste(IM)],
          entrada: [POLITICAS, PLANOS],
          salida: [ESQUEMATICOS, BANCO_HW],
        },
      ],
      entrada: [PLANOS, CONSTITUCION, POLITICAS, REGLAS, CONTRATOS_2],
      salida: [SPECS, ENTORNOS, ARQUITECTURA, LOGICA, ESQUEMATICOS, BANCO_HW],
    },
    {
      id: "fase-3",
      nombre: "Fase 3: Esqueleto funcional mínimo",
      objetivo:
        "Construir el prototipo vertical: unir extremo a extremo una traza mínima del sistema.",
      roles: [ISA, ID, QA, IP, GP, ED, IM, IE],
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
          roles: [...ejecuta(QA), ...asiste(IP)],
          entrada: [ENTORNOS],
          salida: [INFORMES],
        },
        {
          id: "t3-3",
          icono: "task",
          nombre: "Establecer el pipeline de CI/CD base",
          descripcion:
            "Automatizar el empaquetado inicial de las especificaciones y el código del prototipo.",
          roles: [...ejecuta(IP), ...asiste(QA)],
          entrada: [],
          salida: [PIPELINE],
        },
        {
          id: "t3-4",
          icono: "milestone",
          nombre: "Validar reglas de negocio y condiciones agronómicas",
          roles: [...ejecuta(ED), ...asiste(GP)],
          entrada: [],
          salida: [],
        },
        {
          id: "t3-5",
          icono: "task",
          nombre: "Integrar el hardware real en el banco HIL",
          descripcion:
            "Montar sensores y actuadores reales contra la lógica de control: donde el equipo de electrónica y el de software se encuentran.",
          roles: [...ejecuta(IM), ...asiste(IE)],
          entrada: [ENTORNOS, ESQUEMATICOS, BANCO_HW],
          salida: [BANCO_HIL],
        },
      ],
      entrada: [SPECS, ENTORNOS, ARQUITECTURA, LOGICA, ESQUEMATICOS, BANCO_HW],
      salida: [PROTOTIPO, INFORMES, PIPELINE, BANCO_HIL],
    },
    {
      id: "fase-4",
      nombre: "Fase 4: Ciclo de crecimiento",
      objetivo:
        "Escalar el sistema mediante desarrollo paralelo, integración continua y validación en el cultivo.",
      roles: [ISA, ID, QA, IP, GP, ED],
      tareas: [
        {
          id: "t4-1",
          icono: "activity",
          nombre: "Sincronización inter dominio",
          descripcion:
            "Acordar backlogs compartidos entre el gerente de proyecto y los equipos.",
          roles: [...ejecuta(GP), ...asiste(ISA)],
          entrada: [INFORMES],
          salida: [wp("Archivos spec.md / task.md")],
        },
        {
          id: "t4-2",
          icono: "activity",
          nombre: "Construcción en paralelo (contrato primero)",
          descripcion:
            "Desarrollo concurrente de componentes de datos, plataforma, seguridad de vuelo y adaptación.",
          // The five successive increments of the Fase's Entrada are consumed here.
          roles: [...ejecuta(ISA), ...asiste(ID, IP)],
          entrada: [
            PROTOTIPO,
            tool("Monitoreo y operación del dron"),
            tool("Sistema de riego y variables climáticas"),
            tool("Coordinación múltiple de drones"),
          ],
          salida: [wp("Código fuente"), wp("Releases de software")],
        },
        {
          id: "t4-3",
          icono: "process",
          nombre: "Verificación e integración continua",
          descripcion:
            "Ejecución de pruebas automatizadas mediante CI/CD, SIL/HIL y gemelos digitales.",
          roles: [...ejecuta(QA), ...asiste(IP)],
          entrada: [PIPELINE, BANCO_HIL],
          salida: [tool("Pipeline de CI/CD ejecutado"), tool("Entornos SIL/HIL validados")],
        },
        {
          id: "t4-4",
          icono: "milestone",
          nombre: "Despliegue en campo y validación fenológica global",
          descripcion:
            "Llevar los releases al terreno real, calibrar dispositivos y evaluar el impacto del riego con el caficultor.",
          roles: [...ejecuta(IP), ...asiste(ED)],
          entrada: [],
          salida: [wp("Paquete de calibración de sensores y actuadores")],
        },
        {
          id: "t4-5",
          icono: "milestone",
          nombre: "Auditoría de cumplimiento de la Constitución y del plan.md",
          descripcion:
            "Revisar que el incremento no rompa las reglas globales de la Fase 1 ni se salga del plan.md acordado en la Fase 2.",
          roles: [...ejecuta(GP), ...asiste(QA)],
          entrada: [],
          salida: [],
        },
        {
          id: "t4-6",
          icono: "task",
          nombre: "Elaboración y actualización del manual de operación",
          descripcion:
            "Traducir los cambios técnicos de los releases en guías claras para el caficultor.",
          roles: [...ejecuta(ED), ...asiste(ISA)],
          entrada: [],
          salida: [guia("Manual de operación actualizado")],
        },
        {
          id: "t4-7",
          icono: "milestone",
          nombre: "Review del incremento con el caficultor",
          descripcion:
            "Demostrar el incremento en su terreno y recoger lo aprendido: es lo que reordena el backlog del siguiente ciclo.",
          roles: [...ejecuta(ED), ...asiste(GP, QA)],
          entrada: [],
          salida: [LECCIONES],
        },
      ],
      entrada: [
        PROTOTIPO,
        INFORMES,
        PIPELINE,
        BANCO_HIL,
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
        guia("Manual de operación actualizado"),
        LECCIONES,
      ],
    },
  ],
});
