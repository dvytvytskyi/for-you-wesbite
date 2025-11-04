import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Areas from '@/components/Areas';
import Statistics from '@/components/Statistics';
import AboutUs from '@/components/AboutUs';
import ProjectImage from '@/components/ProjectImage';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Statistics />
      <AboutUs />
      <Areas />
      <ProjectImage />
      <Footer />
    </>
  );
}
