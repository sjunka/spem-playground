import type { Modelo } from "./modelo";

export const seed = (): Modelo => ({
  version: 2,
  fases: [
    {
      id: "fase-1",
      nombre: "Fase 1: Especificación global de nivel cero",
      objetivo: "Fijar el marco de gobernanza, límites y contratos iniciales.",
      roles: [
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
        "Ingeniero de seguridad de vuelo",
        "Ingeniero de datos",
      ],
      tareas: [
        {
          id: "t1-1",
          icono: "task",
          nombre: "Definir Constitución, reglas y contratos globales",
          descripcion:
            "Redactar el Constitution.md estableciendo restricciones y principios no negociables.",
        },
        {
          id: "t1-2",
          icono: "task",
          nombre: "Capturar y modelar el conocimiento inicial del dominio",
          descripcion:
            "Consolidar junto al Experto del Dominio (caficultor) las reglas agrónomas generales que regirán el sistema.",
        },
        {
          id: "t1-3",
          icono: "task",
          nombre: "Definir restricciones de seguridad de vuelo y normativas",
          descripcion:
            "Establecer el marco legal y físico preliminar para la operación de drones en la zona.",
        },
      ],
      entrada: [
        { texto: "Conocimiento del experto del dominio (caficultor)", icono: "roleUse" },
        { texto: "Planos del terreno", icono: "workProduct" },
        { texto: "Normatividad vigente", icono: "metric" },
      ],
      salida: [
        { texto: "Constitution.md", icono: "workProduct" },
        { texto: "Políticas y límites de operación", icono: "metric" },
        { texto: "Reglas de negocio", icono: "metric" },
        { texto: "Contratos globales", icono: "workProduct" },
        { texto: "Contratos de integración entre dominios", icono: "workProduct" },
      ],
    },
    {
      id: "fase-2",
      nombre: "Fase 2: Descomposición en dominios",
      objetivo:
        "Fragmentar el sistema, preparar los entornos de simulación y traducir esquemas.",
      roles: [
        "Gerente de proyecto",
        "Ingeniero de datos",
        "Ingeniero de plataforma",
        "Ingeniero de software de adaptación",
      ],
      tareas: [
        {
          id: "t2-1",
          icono: "task",
          nombre: "Identificar subdominios y definir subcontratos internos",
          descripcion:
            "Delimitar responsabilidades entre datos, plataforma, adaptación y vuelo.",
        },
        {
          id: "t2-2",
          icono: "task",
          nombre: "Seleccionar escenario piloto",
          descripcion:
            "Definir el terreno o lote específico para las pruebas iniciales.",
        },
        {
          id: "t2-3",
          icono: "activity",
          nombre: "Traducir esquemas técnicos y disponer entornos SIL, HIL y gemelos digitales",
          descripcion:
            "Preparar la infraestructura de simulación y los archivos base (spec.md, plan.md, task.md).",
        },
        {
          id: "t2-4",
          icono: "task",
          nombre: "Diseñar el modelo de arquitectura preliminar",
          descripcion:
            "Estructurar cómo se interconectarán sensores, drones y el servidor de adaptación (bucle MAPE-K).",
        },
        {
          id: "t2-5",
          icono: "task",
          nombre: "Planificar la estrategia de calibración de sensores y actuadores",
          descripcion:
            "Definir los parámetros base que requerirá el ingeniero de plataforma.",
        },
      ],
      entrada: [
        { texto: "Planos del terreno", icono: "workProduct" },
        { texto: "Constitution.md", icono: "workProduct" },
        { texto: "Políticas y límites de operación", icono: "metric" },
        { texto: "Reglas de negocio", icono: "metric" },
        { texto: "Contratos globales y de integración entre dominios", icono: "workProduct" },
      ],
      salida: [
        { texto: "spec.md, plan.md, task.md", icono: "workProduct" },
        { texto: "Entornos de simulación SIL y HIL configurados", icono: "tool" },
        { texto: "Modelo de arquitectura del sistema", icono: "workProduct" },
        { texto: "Especificaciones de la lógica de adaptación", icono: "workProduct" },
      ],
    },
    {
      id: "fase-3",
      nombre: "Fase 3: Esqueleto funcional mínimo",
      objetivo:
        "Construir el prototipo vertical: unir extremo a extremo una traza mínima del sistema.",
      roles: [
        "Ingeniero de software de adaptación",
        "Ingeniero de datos",
        "QA de software",
        "Ingeniero de plataforma",
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
      ],
      tareas: [
        {
          id: "t3-1",
          icono: "task",
          nombre: "Construir prototipo vertical",
          descripcion:
            "Integrar una primera versión conectando datos de sensores, una regla básica del MAPE-K y una acción simulada.",
        },
        {
          id: "t3-2",
          icono: "milestone",
          nombre: "Validar el prototipo en entorno simulado (SIL/HIL)",
          descripcion:
            "Probar la traza mínima para verificar que la lógica de control responde antes de tocar hardware real.",
        },
        {
          id: "t3-3",
          icono: "task",
          nombre: "Establecer el pipeline de CI/CD base",
          descripcion:
            "Automatizar el empaquetado inicial de las especificaciones y el código del prototipo.",
        },
        {
          id: "t3-4",
          icono: "milestone",
          nombre: "Validar reglas de negocio y condiciones agronómicas",
        },
      ],
      entrada: [
        { texto: "spec.md, plan.md, task.md", icono: "workProduct" },
        { texto: "Entornos de simulación SIL y HIL configurados", icono: "tool" },
        { texto: "Modelo de arquitectura del sistema", icono: "workProduct" },
        { texto: "Especificaciones de la lógica de adaptación", icono: "workProduct" },
      ],
      salida: [
        { texto: "Prototipo vertical funcional", icono: "workProduct" },
        { texto: "Informes de validación de control", icono: "workProduct" },
        { texto: "Pipeline de CI/CD base", icono: "tool" },
      ],
    },
    {
      id: "fase-4",
      nombre: "Fase 4: Ciclo de crecimiento",
      objetivo:
        "Escalar el sistema mediante desarrollo paralelo, integración continua y validación en el cultivo.",
      roles: [
        "Ingeniero de software de adaptación",
        "Ingeniero de datos",
        "QA de software",
        "Ingeniero de plataforma",
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
      ],
      tareas: [
        {
          id: "t4-1",
          icono: "activity",
          nombre: "Sincronización inter dominio",
          descripcion:
            "Acordar backlogs compartidos entre el gerente de proyecto y los equipos.",
        },
        {
          id: "t4-2",
          icono: "activity",
          nombre: "Construcción en paralelo (contrato primero)",
          descripcion:
            "Desarrollo concurrente de componentes de datos, plataforma, seguridad de vuelo y adaptación.",
        },
        {
          id: "t4-3",
          icono: "process",
          nombre: "Verificación e integración continua",
          descripcion:
            "Ejecución de pruebas automatizadas mediante CI/CD, SIL/HIL y gemelos digitales.",
        },
        {
          id: "t4-4",
          icono: "milestone",
          nombre: "Despliegue en campo y validación fenológica global",
          descripcion:
            "Llevar los releases al terreno real, calibrar dispositivos y evaluar el impacto del riego con el caficultor.",
        },
        {
          id: "t4-5",
          icono: "milestone",
          nombre: "Auditoría de cumplimiento de la Constitución",
          descripcion:
            "Revisar que los incrementos no rompan las reglas globales establecidas en la Fase 1.",
        },
        {
          id: "t4-6",
          icono: "task",
          nombre: "Elaboración y actualización del manual de operación",
          descripcion:
            "Traducir los cambios técnicos de los releases en guías claras para el caficultor.",
        },
      ],
      entrada: [
        { texto: "Prototipo vertical funcional", icono: "workProduct" },
        { texto: "Informes de validación de control", icono: "workProduct" },
        { texto: "Pipeline de CI/CD base", icono: "tool" },
        { texto: "Monitoreo y operación del dron", icono: "tool" },
        { texto: "Sistema de riego y variables climáticas", icono: "tool" },
        { texto: "Coordinación múltiple de drones", icono: "tool" },
      ],
      salida: [
        { texto: "Código fuente", icono: "workProduct" },
        { texto: "Archivos spec.md / task.md", icono: "workProduct" },
        { texto: "Pipeline de CI/CD ejecutado", icono: "tool" },
        { texto: "Entornos SIL/HIL validados", icono: "tool" },
        { texto: "Paquete de calibración de sensores y actuadores", icono: "workProduct" },
        { texto: "Releases de software", icono: "workProduct" },
        { texto: "Manual de operación actualizado", icono: "metric" },
      ],
    },
  ],
});
