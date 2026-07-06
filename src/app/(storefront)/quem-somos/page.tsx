import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quem somos nós | Tríade Essenza Parfum",
  description:
    "Conheça a história da Tríade Essenza Parfum, empresa familiar fundada por três irmãos e dedicada a perfumes importados originais."
};

const founders = [
  {
    name: "Edmundo Passos",
    image: "/brand/founders/edmundo-passos.png",
    width: 411,
    height: 722,
    text: "A ideia começou com sua experiência na revenda de fragrâncias e ganhou força ao ser compartilhada com seus irmãos."
  },
  {
    name: "Antonio Rafael",
    image: "/brand/founders/antonio-rafael.png",
    width: 638,
    height: 639,
    text: "Um dos irmãos fundadores que transformam a união familiar em uma operação digital estruturada e confiável."
  },
  {
    name: "Marcio Cavalcante",
    image: "/brand/founders/marcio-cavalcante.png",
    width: 566,
    height: 723,
    text: "Parte da tríade que sustenta o propósito de oferecer fragrâncias originais com cuidado em cada etapa da jornada."
  }
];

const brandMeanings = [
  {
    term: "Tríade",
    text: "Representa os três irmãos, a parceria, a confiança e a força de uma união familiar construída com propósito."
  },
  {
    term: "Essenza",
    text: "Vem de essência, o elemento que dá personalidade a cada fragrância e conecta memória, presença e identidade."
  },
  {
    term: "Parfum",
    text: "Aproxima a marca do universo internacional da perfumaria, com sofisticação, elegância e atenção à qualidade."
  }
];

const values = ["Harmonia", "Elegância", "Excelência", "Confiança"];

export default function QuemSomosPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="page-shell about-hero__content">
          <div className="about-hero__copy">
            <p className="about-label">Quem somos nós</p>
            <h1>Três irmãos, uma essência em comum.</h1>
            <p>
              A Tríade Essenza Parfum nasceu da união, da confiança e do
              compromisso entre seus fundadores. Uma empresa familiar que atua
              no comércio eletrônico para oferecer perfumes importados originais
              com sofisticação e credibilidade.
            </p>
            <div className="about-hero__actions">
              <Link className="primary-action" href="/produtos">
                Ver perfumes
              </Link>
              <Link
                className="secondary-action secondary-action--hero"
                href="mailto:suporte@triadeessenzaparfum.com.br"
              >
                Falar com a central
              </Link>
            </div>
          </div>

          <div
            className="about-hero__mark"
            aria-label="Logotipo Tríade Essenza Parfum"
          >
            <Image
              src="/brand/triade-logo-horizontal-transparent.png"
              alt="Tríade Essenza Parfum"
              width={535}
              height={134}
              priority
            />
            <p>Excelência em cada essência.</p>
          </div>
        </div>
      </section>

      <section
        className="page-shell about-story"
        aria-labelledby="about-story-title"
      >
        <div className="about-story__intro">
          <p className="about-label">Nossa origem</p>
          <h2 id="about-story-title">
            Uma iniciativa familiar com visão de longo prazo.
          </h2>
        </div>
        <div className="about-story__text">
          <p>
            A marca nasceu a partir da experiência de Edmundo na revenda de
            fragrâncias em seu ambiente de trabalho. Ao perceber o potencial da
            atividade, ele compartilhou a ideia com seus irmãos e a iniciativa
            começou a tomar forma como um negócio estruturado.
          </p>
          <p>
            O propósito é simples e exigente: oferecer fragrâncias originais que
            proporcionem elegância, presença e uma experiência marcante em cada
            compra.
          </p>
        </div>
      </section>

      <section
        className="about-founders"
        aria-labelledby="about-founders-title"
      >
        <div className="page-shell">
          <div className="about-section-heading">
            <p className="about-label">Fundadores</p>
            <h2 id="about-founders-title">A força por trás da Tríade.</h2>
          </div>
          <div className="about-founder-grid">
            {founders.map((founder) => (
              <article className="about-founder" key={founder.name}>
                <div className="about-founder__image">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={founder.width}
                    height={founder.height}
                    sizes="(max-width: 760px) 82vw, 30vw"
                  />
                </div>
                <div>
                  <span>Fundador</span>
                  <h3>{founder.name}</h3>
                  <p>{founder.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-shell about-symbol"
        aria-labelledby="about-symbol-title"
      >
        <div className="about-symbol__brand">
          <Image
            src="/brand/triade-logo-horizontal-transparent.png"
            alt=""
            width={535}
            height={134}
          />
        </div>
        <div className="about-symbol__content">
          <p className="about-label">O nome</p>
          <h2 id="about-symbol-title">
            A história contada pela própria marca.
          </h2>
          <div className="about-meaning-list">
            {brandMeanings.map((item) => (
              <div className="about-meaning" key={item.term}>
                <strong>{item.term}</strong>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-values" aria-label="Valores da marca">
        <div className="page-shell about-values__content">
          {values.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      </section>

      <section
        className="page-shell about-closing"
        aria-labelledby="about-closing-title"
      >
        <p className="about-label">Nossa promessa</p>
        <h2 id="about-closing-title">
          Perfumes originais, presença marcante e uma experiência cuidada.
        </h2>
        <p>
          Atuamos para consolidar a Tríade Essenza Parfum como referência em
          perfumes importados, unindo qualidade, procedência e atendimento
          diferenciado.
        </p>
        <Link className="primary-action" href="/produtos">
          Conhecer a vitrine
        </Link>
      </section>
    </main>
  );
}
