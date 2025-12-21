export const Resume = () => null;

export async function getServerSideProps() {
  return {
    redirect: {
      destination:
        'https://drive.google.com/file/d/1_rJJP56HZmgb1ZsBzcQs-e8OHWY1YHMC/view?usp=sharing',
      permanent: false,
    },
  };
}
