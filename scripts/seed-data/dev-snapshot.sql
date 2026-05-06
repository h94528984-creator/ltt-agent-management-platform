--
-- PostgreSQL database dump
--

\restrict 9rUQG6cWjm5ljfhIXchXHIpprR5obmzQXMhWrdyFdHPtxfxvbBdTwPnyb0s0j2y

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.agents DISABLE TRIGGER ALL;

INSERT INTO public.agents VALUES (191, 'محل المهندس للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.775051, 13.018975, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (192, 'شركة الظهرة لاستيراد الاجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 32.890132, 13.192054, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (193, 'البوزيدي لبيع الاجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.85094, 13.185926, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (194, 'المتميز الجديد', '', 'dealer', NULL, NULL, NULL, 'active', 32.714355, 13.197353, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (195, 'محل المرسال للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.873171, 13.211002, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (196, 'أويس للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.528327, 13.016847, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (197, 'أنس للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.839504, 13.191678, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (198, 'محل الدقة للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.855353, 13.244593, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (199, 'المصدر للاجهزة الكهربائية', '', 'dealer', NULL, NULL, NULL, 'active', 32.88411, 13.345664, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (200, 'عالم الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.853405, 13.26071, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (201, 'الاشارة للاجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 32.875279, 13.251449, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (202, 'شركة المنطق لاستيراد الأجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.883719, 13.185387, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (203, 'شركة الاستشاري لاستيراد الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.88814, 13.202125, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (204, 'OI9', '', 'dealer', NULL, NULL, NULL, 'active', 32.889486, 13.243079, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (205, 'AR Technology', '', 'dealer', NULL, NULL, NULL, 'active', 32.850227, 13.179204, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (206, 'محل دار الشارقة للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.852324, 13.160838, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (207, 'محل الارقام الذهبية', '', 'dealer', NULL, NULL, NULL, 'active', 32.791015, 13.10991, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (208, 'شركة المستقبل الزاهر', '', 'dealer', NULL, NULL, NULL, 'active', 32.8937, 13.17947, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (209, 'المدى للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.884455, 13.236391, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (210, 'شركة الليث لخدمات الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.862731, 13.093434, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (211, 'هديل للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 31.841955, 11.339212, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (212, 'دار المفيد لاستيراد الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.870409, 13.196393, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (213, 'محل كونكشن فور تيك', '', 'dealer', NULL, NULL, NULL, 'active', 32.894519, 13.204016, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (214, 'مركز الرسالة الرقمية', '', 'dealer', NULL, NULL, NULL, 'active', 32.871444, 13.19176, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (215, 'مركز ابو خيط للحاسب الالي', '', 'dealer', NULL, NULL, NULL, 'active', 32.906458, 13.245978, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (216, 'محل ادم لبيع الحواسيب', '', 'dealer', NULL, NULL, NULL, 'active', 32.712083, 13.067236, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (217, 'مكتب البرق-مسلاته', '', 'dealer', NULL, NULL, NULL, 'active', 32.579788, 14.038641, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (218, 'النجمة للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.862707, 13.289694, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (219, 'اقزيط للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.391856, 14.972886, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (220, 'محل العامرة', '', 'dealer', NULL, NULL, NULL, 'active', 31.450788, 15.255224, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (221, 'جبريل لتوزيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.336164, 15.092423, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (222, 'المجرش لبيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.541897, 14.393231, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (223, 'شاهين للهاتف المحمول', '', 'dealer', NULL, NULL, NULL, 'active', 32.712475, 13.845144, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (224, 'مركز التقنية الحديثة للحاسبات', '', 'dealer', NULL, NULL, NULL, 'active', 32.373821, 15.094838, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (225, 'بهاء للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.851788, 13.203213, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (226, 'شركة الارتقاء الراسخ', '', 'dealer', NULL, NULL, NULL, 'active', 32.343747, 15.078323, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (227, 'مركز المدينة-ودان', '', 'dealer', NULL, NULL, NULL, 'active', 29.160054, 16.140695, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (228, 'المركز العربي الهندسي - مصراتة', '', 'dealer', NULL, NULL, NULL, 'active', 32.374976, 15.083255, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (229, 'شركة التقنية الذكية', '', 'dealer', NULL, NULL, NULL, 'active', 32.367493, 15.092361, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (230, 'الموسوعة لبيع الإجهزة الإلكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 31.749835, 14.018151, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (231, 'العالم لتوزيع المواد الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 32.372932, 15.092201, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (232, 'شركة الرائد الذهبي', '', 'dealer', NULL, NULL, NULL, 'active', 32.871611, 13.344895, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (233, 'المستقبل لخدمات الانترنت', '', 'dealer', NULL, NULL, NULL, 'active', 32.375507, 15.125536, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (234, 'شركة البرج الصامد', '', 'dealer', NULL, NULL, NULL, 'active', 32.366207, 15.078948, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (235, 'محل أيوب التونسي للالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 32.756588, 13.719489, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (236, 'مكتب الخليج لخدمات الحاسوب - هون', '', 'dealer', NULL, NULL, NULL, 'active', 29.122526, 15.937903, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (237, 'مركز رابسا للحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 24.960229, 10.181984, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (238, 'مركز التواصل للدورات التدريبية', '', 'dealer', NULL, NULL, NULL, 'active', 26.566929, 12.796213, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (239, 'التقنية الحديثة لخدمات الأنترنت', '', 'dealer', NULL, NULL, NULL, 'active', 29.981287, 14.262911, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (240, 'مركز برج التقنية للحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 26.523615, 13.008364, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (241, 'مركز الفردوس لتقنيات الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 27.48681, 13.124343, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (242, 'الباشا للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 26.596142, 12.733261, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (243, 'مركز الورقة الذهبية للتدريب', '', 'dealer', NULL, NULL, NULL, 'active', 27.500138, 13.26, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (244, 'مركز الامتياز للإلكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 31.432194, 12.988121, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (245, 'مركز الثريا للأتصالات والحاسبات', '', 'dealer', NULL, NULL, NULL, 'active', 27.547031, 14.270713, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (246, 'مركز الانوار للحاسوب والتدريب', '', 'dealer', NULL, NULL, NULL, 'active', 25.781115, 10.561602, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (247, 'ماضي لبيع الأجهزة الكهربائية', '', 'dealer', NULL, NULL, NULL, 'active', 25.929093, 14.432153, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (248, 'مركز الصدارة للتدريب', '', 'dealer', NULL, NULL, NULL, 'active', 26.130137, 14.735579, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (249, 'شركة الرحال لخدمات الاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.844918, 13.172847, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (250, 'المتميز 2 ترهونة', '', 'dealer', NULL, NULL, NULL, 'active', 32.433063, 13.627938, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (251, 'ابناء الغناي لبيع الاجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.843986, 13.205345, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (252, 'الياسمين موبايل للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.818822, 13.070235, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (253, 'مركز أفاق لبيع الاجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 29.070449, 15.783151, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (254, 'القمة الجديدة', '', 'dealer', NULL, NULL, NULL, 'active', 32.690635, 13.193049, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (255, 'محل النخلة لبيع اجهزة الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.17836, 12.860494, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (256, 'المعالج لخدمات الحاسب الالي', '', 'dealer', NULL, NULL, NULL, 'active', 32.375583, 15.092355, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (257, 'ليزر لتقنية ونظم المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 27.031781, 14.433592, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (258, 'شركة السهم لاستيراد الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.874642, 13.211023, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (259, 'مركز المعلم', '', 'dealer', NULL, NULL, NULL, 'active', 27.052379, 14.415972, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (260, 'شركة سفير للالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 32.867229, 13.13008, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (261, 'محل ابناء الشريف واولاده', '', 'dealer', NULL, NULL, NULL, 'active', 32.106614, 20.077516, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (262, 'التقنية - القبة', '', 'dealer', NULL, NULL, NULL, 'active', 32.762475, 22.236418, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (263, 'شركة العبد', '', 'dealer', NULL, NULL, NULL, 'active', 32.086102, 23.949761, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (264, 'الواحة الحاسوب والإنترنت - زليتن', '', 'dealer', NULL, NULL, NULL, 'active', 32.469955, 14.567186, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (265, 'الانظمة الدقيقة لاستيراد الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.780967, 13.301781, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (266, 'محل الاجهزة الذكية', '', 'dealer', NULL, NULL, NULL, 'active', 32.862964, 13.315078, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (267, 'شركة الفويهات للاتصالات-بنغازي', '', 'dealer', NULL, NULL, NULL, 'active', 32.095548, 20.081799, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (268, 'انوار بنغازي', '', 'dealer', NULL, NULL, NULL, 'active', 32.090724, 20.111389, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (269, 'شركة الدليل الجديد للتقنية', '', 'dealer', NULL, NULL, NULL, 'active', 27.051725, 14.415769, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (270, 'العصور للحاسب الآلي', '', 'dealer', NULL, NULL, NULL, 'active', 32.377087, 15.099197, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (271, 'مركز مهند للإتصالات والتقنية', '', 'dealer', NULL, NULL, NULL, 'active', 32.752388, 12.665957, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (272, 'محل المميز لبيع اجهزة النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.81929, 13.262321, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (273, 'محل منتدى البدري', '', 'dealer', NULL, NULL, NULL, 'active', 32.837635, 13.215265, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (274, 'محل أيهم لبيع احهزة الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.86828, 13.114088, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (275, 'شركة الضيافة', '', 'dealer', NULL, NULL, NULL, 'active', 32.907962, 13.235736, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (276, 'مركز الغد لخدمات الحاسب -اجدابيا', '', 'dealer', NULL, NULL, NULL, 'active', 30.75666, 20.221481, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (277, 'مركز الارشاد لخدمات الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.098085, 20.080306, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (278, 'الشاهين 2', '', 'dealer', NULL, NULL, NULL, 'active', 32.184522, 20.595159, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (279, 'زهور الغد لبيع الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.034629, 13.263273, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (280, 'محل السنابل لبيع الهواتف', '', 'dealer', NULL, NULL, NULL, 'active', 31.667037, 20.246009, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (281, 'علوم الثقنية - الفويهات', '', 'dealer', NULL, NULL, NULL, 'active', 32.082359, 20.080844, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (282, 'المودة 3 لبيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.664967, 14.257783, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (283, 'محل المتميز لبيع الاجهزة/طمزين', '', 'dealer', NULL, NULL, NULL, 'active', 31.844429, 11.412942, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (284, 'تاكنس', '', 'dealer', NULL, NULL, NULL, 'active', 32.482437, 21.127117, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (285, 'تشاركية المرجان', '', 'dealer', NULL, NULL, NULL, 'active', 32.102475, 20.083155, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (286, 'اللواج', '', 'dealer', NULL, NULL, NULL, 'active', 32.066325, 20.086839, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (287, 'محل الافاق لبيع الحاسب الالي', '', 'dealer', NULL, NULL, NULL, 'active', 32.851317, 12.061191, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (288, 'مركز التواصل لخدمات الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.851903, 12.062876, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (289, 'تشاركية المعارف للحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.931417, 12.083263, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (290, 'مركز كليك لخدمات الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.92891, 12.089389, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (291, 'محل عالم التكنولوجيا', '', 'dealer', NULL, NULL, NULL, 'active', 32.792837, 12.47946, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (292, 'مركز الامل للتقنية المكتبية', '', 'dealer', NULL, NULL, NULL, 'active', 32.769975, 12.567094, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (293, 'شركة الاوائل الدولية', '', 'dealer', NULL, NULL, NULL, 'active', 32.760334, 12.570402, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (294, 'شركة التواتر للالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 32.760601, 12.735873, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (295, 'المركز الاستشاري (القلعة)', '', 'dealer', NULL, NULL, NULL, 'active', 32.752155, 12.739956, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (296, 'مركز العروسي لبيع الاجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.769186, 12.753036, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (297, 'مركز خدمات الزاوية', '', 'dealer', NULL, NULL, NULL, 'active', 32.76605, 12.756257, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (298, 'الجيل الرابع - الزاوية', '', 'dealer', NULL, NULL, NULL, 'active', 32.776517, 12.713215, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (299, 'السرايا للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.763066, 12.567523, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (300, 'المتمكن للهاتف المحمول', '', 'dealer', NULL, NULL, NULL, 'active', 32.792171, 12.484617, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (301, 'محل تميم لبيع وصيانة الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.758576, 12.635065, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (302, 'مركز العالمية نالوت', '', 'dealer', NULL, NULL, NULL, 'active', 31.864332, 10.982607, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (303, 'شركة تيبستي لاستيراد اجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.822852, 13.240664, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (304, 'محل الامتياز الراقي للحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 31.362542, 15.243632, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (305, 'محل همام لبيع اجهزة الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 31.995057, 12.346744, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (306, 'محل التقني الرجبان', '', 'dealer', NULL, NULL, NULL, 'active', 31.950412, 12.095018, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (307, 'بابل للاتصالات والانترنت- زليتن', '', 'dealer', NULL, NULL, NULL, 'active', 32.471259, 14.564145, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (308, 'محلات الزاوي-درنة', '', 'dealer', NULL, NULL, NULL, 'active', 32.766908, 22.635084, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (309, 'مركز المهندس للاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.597292, 13.174659, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (310, 'محل التقنية - نالوت', '', 'dealer', NULL, NULL, NULL, 'active', 31.818771, 11.051107, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (311, 'الزنتان سوفت لخدمات الكمبيوتر', '', 'dealer', NULL, NULL, NULL, 'active', 31.931429, 12.251905, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (312, 'مكتبة الاتحاد للقرطاسية', '', 'dealer', NULL, NULL, NULL, 'active', 32.162143, 13.009313, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (313, 'راس الذهب', '', 'dealer', NULL, NULL, NULL, 'active', 32.799288, 21.992955, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (314, 'مركز صخر لخدمات الحاسب -المرج', '', 'dealer', NULL, NULL, NULL, 'active', 32.488374, 20.825548, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (315, 'شركة وسائل للاتصالات والتقنية', '', 'dealer', NULL, NULL, NULL, 'active', 32.87218, 13.150979, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (316, 'محل الطويري للاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.889003, 13.236092, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (317, 'محل نغم للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.893655, 13.181064, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (318, 'شركة المدخل الالكتروني', '', 'dealer', NULL, NULL, NULL, 'active', 32.861716, 13.090843, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (319, 'مركز رميضة لخدمات الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.369668, 15.18462, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (320, 'موبايلي بلاي للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.680563, 13.098218, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (321, 'مركز التكامل للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.334357, 15.093365, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (322, 'مركز الدغني لخدمات الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.384895, 14.96751, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (323, 'شركة شامل ليبيا للاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.348137, 15.043622, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (324, 'طرابلس لبيع الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.839248, 13.18262, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (325, 'التغطية للاجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 27.041711, 14.423103, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (326, 'العالم للحاسوب / درج', '', 'dealer', NULL, NULL, NULL, 'active', 32.039559, 12.873662, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (327, '(شركة الليث لخدمات الحاسب الالي (3', '', 'dealer', NULL, NULL, NULL, 'active', 32.039563, 12.87364, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (328, 'شركة المهندس البارع للحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.039556, 12.872989, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (329, 'شركة السفير الرقمي', '', 'dealer', NULL, NULL, NULL, 'active', 32.879525, 13.178756, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (330, 'شركة رواد الجبل لتقنية المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 32.068446, 12.694102, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (331, 'محل السد لبيع اجهزة الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.059966, 12.703218, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (332, 'محل وعد للالكترونات والهواتف', '', 'dealer', NULL, NULL, NULL, 'active', 31.844989, 11.339722, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (333, 'مركز التقدم لصيانة الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.199245, 13.043082, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (334, 'شركة المتصل للإتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.884737, 13.342198, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (335, 'شركة روائع الإبداع', '', 'dealer', NULL, NULL, NULL, 'active', 32.838932, 13.218484, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (336, 'محل ميجاهيرتز لصيانة الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.824525, 13.032373, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (337, 'مكتب بوابة المستقبل', '', 'dealer', NULL, NULL, NULL, 'active', 32.878974, 13.202806, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (338, 'تشاركية الزرقاء للرقميات', '', 'dealer', NULL, NULL, NULL, 'active', 32.859244, 13.091395, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (339, 'مركز ابن خلدون للادوات المكتبية', '', 'dealer', NULL, NULL, NULL, 'active', 32.890184, 13.172441, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (340, 'شركة السراج لاستيراد الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.895078, 13.166593, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (341, 'مركز الكناري للتقنية', '', 'dealer', NULL, NULL, NULL, 'active', 32.770282, 13.015106, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (342, 'شركة الليث 2 لخدمات الحاسب', '', 'dealer', NULL, NULL, NULL, 'active', 32.861425, 13.090837, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (343, 'شركة العلامة المتجددة', '', 'dealer', NULL, NULL, NULL, 'active', 32.857887, 13.200864, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (344, 'محل الباروني 2 للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.854296, 13.077175, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (345, 'محل عالم التقنية للالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 31.935567, 10.662353, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (346, 'مركز اينارو للحاسبات', '', 'dealer', NULL, NULL, NULL, 'active', 32.758678, 12.7392, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (347, 'مركز اللمسة السحرية', '', 'dealer', NULL, NULL, NULL, 'active', 32.761961, 12.681994, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (348, 'شركة العالمية للقرطاسية', '', 'dealer', NULL, NULL, NULL, 'active', 32.768856, 12.761048, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (349, 'مركز الشبكة للحاسب اللآلي', '', 'dealer', NULL, NULL, NULL, 'active', 31.801345, 14.052884, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (350, 'مركز المدار لخدمات الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 31.932979, 12.252662, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (351, 'شركة البديل لاستيراد الاجهزة', '', 'dealer', NULL, NULL, NULL, 'active', 32.867275, 13.214343, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (352, 'محلات الحران للاجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 32.05915, 11.542611, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (353, '4G للأجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 26.094, 13.685608, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (354, 'المتداول الاول لكروت الدفع', '', 'dealer', NULL, NULL, NULL, 'active', 32.838702, 13.182743, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (355, 'محل العالمي لبيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 25.929306, 14.437781, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (356, 'روتانا للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.842746, 13.153682, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (357, 'متجر كلا kala store', '', 'dealer', NULL, NULL, NULL, 'active', 32.8569, 13.101669, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (358, 'مركز الجديدة لبيع الحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.768941, 12.290646, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (359, 'ميلانو للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.75889, 12.910924, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (360, 'نور الدين لبيع و صيانة الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.565598, 13.276401, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (361, 'برج السلام للاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.8937, 13.17947, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (362, 'منتدى القصر للهاتف المحمول', '', 'dealer', NULL, NULL, NULL, 'active', 32.795742, 13.136839, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (363, 'شركة فاضل لبيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.852418, 13.315314, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (364, 'المسار المتميز للاتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.846941, 13.132138, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (365, 'المتألق الجديد للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.618829, 13.223663, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (366, 'شركة الاتحاد الدولي للخدمات', '', 'dealer', NULL, NULL, NULL, 'active', 32.893555, 13.20767, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (367, 'شركة مسارات لتقنية المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 32.87368, 13.181205, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (368, 'شركة تداول للتقنية الإلكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 32.870417, 13.124316, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (369, 'شركة التفاني للإتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.905555, 13.255769, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (370, 'شركة بكم للخدمات المالية', '', 'dealer', NULL, NULL, NULL, 'active', 32.905359, 13.23011, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (371, 'شركة التميم لتقنية المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 32.871044, 13.229962, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (372, 'شركة ربيانا للإتصالات', '', 'dealer', NULL, NULL, NULL, 'active', 32.847538, 13.06312, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (373, 'شركة الجبل لتقنية المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 32.860585, 13.128413, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (374, 'الوفاء مبايل', '', 'dealer', NULL, NULL, NULL, 'active', 32.885345, 13.339167, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (375, 'مجمع مرسول السلام للالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 32.682258, 13.174888, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (376, 'معاذ للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.892395, 11.983135, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (377, 'التقنية للاجهزة الالكترونية', '', 'dealer', NULL, NULL, NULL, 'active', 30.163256, 10.461178, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (378, 'شركة الحرية لخدمات الدفع', '', 'dealer', NULL, NULL, NULL, 'active', 32.073983, 20.092017, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (379, 'أبعاد للتقنية و الالكترونات', '', 'dealer', NULL, NULL, NULL, 'active', 32.783403, 13.235272, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (380, 'محل الاتقان 2', '', 'dealer', NULL, NULL, NULL, 'active', 32.541019, 13.177338, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (381, 'محمد الهادي للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.835031, 13.292018, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (382, 'الشبكة العريقة لتقنية المعلومات', '', 'dealer', NULL, NULL, NULL, 'active', 32.835617, 13.292048, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (383, 'الانجاز لبيع الهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 27.03285, 14.460012, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (384, 'شركة قاريونس للاعمال الكهربية', '', 'dealer', NULL, NULL, NULL, 'active', 26.085104, 13.510397, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (385, 'الشبكة للهاتف النقال', '', 'dealer', NULL, NULL, NULL, 'active', 32.698762, 13.845406, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (18, 'مركز العالمية للأجهزة الأكترونية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (19, 'مكتب عين الفرس للاتصالات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (20, 'مكتبة الدقة للقرطاسية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (21, 'مكتبة الاتحاد للقرطاسية والحاسبات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (22, 'مركز المدار لخدمات الانترنت والهاتف النقال وكمالياته', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (23, 'مركز الاتقان لخدمات الانترنت', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (24, 'الليث 3', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (25, 'المهندس البارع للحاسب الألي والانترنت والتدريب والتعليم والتأهيل', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (26, 'محل يفرن لخدمات الحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (27, 'محل التقني للإلكترونيات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (28, 'شركة المتألق للاجهزة الالكترونية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (29, 'تشاركية الحاسب الآلي لاستيراد الالكترونات والحواسيب', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (31, 'محل الدباغ للهاتف النقال', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (34, 'محل اكاكوس لبيع النقالات وخدمات الانترنت', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (35, 'محل همام لبيع اجهزة الحاسب الآلي وكمالياته', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (36, 'محل النخلة لبيع اجهزة الحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (37, 'محل لؤلؤة الجبل لبيع وصيانة اجهزة الحاسب الآلي والهاتف النقال', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (38, 'محل الأنوار للحاسب الألي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (39, 'مركز الشعاع', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (40, 'محل وعد للالكترونات والهواتف المحمولة', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (41, 'محل المتميز - الجوش', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (42, 'محل الباروني لبيع النقالات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (43, 'محلات جبل نفوسة', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (2, 'مركز التواصل لصيانة الحاسب الالي', 'الجميل', 'dealer', NULL, NULL, NULL, 'active', 32.851903, 12.062876, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الجميل', NULL, '913254726', 'adrefr_2007@yahoo.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (3, 'شركة التواتر للالكترونات المساهمة', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.760601, 12.735873, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, '913734055', 'shrief_a@yahoo.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (4, 'مركز القلعة للتدريب والتقنية', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.752155, 12.739956, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, '913741146', 'alkalaacenter@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (6, 'مركز اللمسة السحرية للالكترونات', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.761961, 12.681994, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, '911874676', 'o.almeshaal@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (7, 'مركز العروسي لبيع الاجهزة الالكترونية وملحقاته', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.769186, 12.753036, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, '916993000', 'alarosei.zw@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (8, 'مركز نور السفير لتقنية الحاسوب', 'العجيلات', 'dealer', NULL, NULL, NULL, 'active', 32.757192, 12.37513, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'العجيلات', NULL, '913209021', 'norydeep1@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (9, 'مركز الانطلاقة للحواسيب', 'رقدالين', 'dealer', NULL, NULL, NULL, 'active', 32.891658, 11.975783, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'رقدالين', NULL, '913755080', 'fathimmelad@yahoo.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (10, 'محل الأفاق لبيع الحاسب الالي', 'زلطن', 'dealer', NULL, NULL, NULL, 'active', 32.851317, 12.061191, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'زلطن', NULL, '927416013', 'alafaq095@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (11, 'تشاركية المعارف للحاسوب واللغات والترجمة القانونية', 'زوارة', 'dealer', NULL, NULL, NULL, 'active', 32.931417, 12.083263, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'زوارة', NULL, '925670607', 'almareefcompany@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (12, 'مركز كليك لخدمات الحاسب الآلي', 'زوارة', 'dealer', NULL, NULL, NULL, 'active', 32.92891, 12.089389, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'زوارة', NULL, '917784160', 'aselbouali@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (13, 'مركز ديسك توب للحاسوب', 'زوارة', 'dealer', NULL, NULL, NULL, 'active', 32.930389, 12.081669, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'زوارة', NULL, '928071251', 'desktop.zw@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (15, 'محل عالم التكنولوجيا لبيع الحاسب الالي وملحقاته وصيانة', 'صبراته', 'dealer', NULL, NULL, NULL, 'active', 32.792837, 12.47946, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'صبراته', NULL, '918000093', 'nezar2634@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (16, 'مكتب الأمل للتقنية المكتبية - صرمان', 'صرمان', 'dealer', NULL, NULL, NULL, 'active', 32.769975, 12.567094, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'صرمان', NULL, '915981162', 'alaml.almotakdema.co@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (17, 'شركة الأوائل الدولية المتحدة لاستيراد الأجهزة', 'صرمان', 'dealer', NULL, NULL, NULL, 'active', 32.760334, 12.570402, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'صرمان', NULL, '915213694', 'alawael.inter@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (30, 'محل المتميز لبيع الاجهزة الالكترونية والنقالات', 'ترهونة', 'dealer', NULL, NULL, NULL, 'active', 32.43302, 13.62812, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ترهونة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (32, 'شركة رواد الجبل لتقنية المعلومات والاتصالات والحاسب الآلي', 'ككلة', 'dealer', NULL, NULL, NULL, 'active', 32.068446, 12.694102, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ككلة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (33, 'محل السد لبيع اجهزة الهاتف النقال', 'ككلة', 'dealer', NULL, NULL, NULL, 'active', 32.059966, 12.703218, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ككلة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (44, 'محل هديل لبيع الهاتف النقال', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (45, 'مركز المتقدم لبيع وصيانة الحاسوب والالكترونات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (46, 'زنتان سوفت', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (47, 'مركز تواصل', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (48, 'التقنية لبيع وشراء وصيانة الحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (49, 'مركز تواصل 2', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (50, 'محل أوسمان للهاتف النقال وكمالياته', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (55, 'محل الساحلي للهاتف النقال', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (56, 'شركة السهم للحاسبات والالات الالكترونية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (57, 'محل القبطان للحاسبات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (58, 'شركة المتصل للإتصالات والتقنية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (60, 'شركة روائع الإبداع لاستيراد الحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (61, 'شركة القدرة للأعمال والمنظومات الكهربائية والالكترونية والاتصالات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (63, 'شركة الليث لخدمات الحاسب الالي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (64, 'شركة المحيط التقنية لاستيراد الحاسب الآلي وملحقاته', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (66, 'شركة فضاء المعلومات للتقنية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (68, 'محل ميزران لبيع الهاتف المحمول', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (69, 'تشاركية نبتون لخدمات الاتصالات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (70, 'مكتب بوابة المستقبل لخدمات الحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (75, 'مركز الثقة للحاسبات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (76, 'مركز أفاق المستقبل لخدمات الحاسوب والإنترنت', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (79, 'مركز ابن خلدون لخدمات الحاسوب', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (81, 'مركز الكناري للتقنية وخدمات الحاسوب', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (84, 'شركة الليث لخدمات الحاسب الالي 2', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (85, 'الدليل أبناء الجهد لخدمات الحاسوب', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (87, 'محل أيوب التونسي للالكترونات والحاسب الآلي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (88, 'شركة اتصالاتي لاستيراد الحاسب الالي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (89, 'شركة المارد للاتصالات وتقنية المعلومات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (91, 'محل أيهم لبيع اجهزة الهاتف النقال وكمالياته', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (92, 'محل الزمام للهاتف النقال', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (52, 'شركة البديل - الزاوية', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.765235, 12.732412, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (53, 'شركة البديل - بنغازي-البيبسي', 'بنغازي', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'بنغازي', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (59, 'محل المهندس لبيع الهاتف النقال', 'جنزور', 'dealer', NULL, NULL, NULL, 'active', 32.774864, 13.019068, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'جنزور', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (62, 'محل الارقام الذهبية لبيع الهاتف النقال', 'الكريمية', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الكريمية', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (65, 'محل المدى لبيع الهاتف النقال وكمالياته', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (67, 'محل ميجاهيرتز لبيع وصيانة الحاسب الالي', 'جنزور', 'dealer', NULL, NULL, NULL, 'active', 32.824525, 13.032373, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'جنزور', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (71, 'مركز الكون لخدمات الحاسب', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.883935, 13.342899, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (73, 'تشاركية الزرقاء للرقميات والإتصالات وتقنية المعلومات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.859244, 13.091395, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (74, 'شركة المنطلق لخدمات الحاسوب', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.893161, 13.203554, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (77, 'تشاركية مرسول السلام للاتصالات', 'قصربن غشير', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'قصربن غشير', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (78, 'مكتب الاستشاري لتقنية المعلومات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.8882, 13.202484, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (82, 'مركز حازم لخدمات الحاسوب', 'قصر خيار', 'dealer', NULL, NULL, NULL, 'active', 32.69839, 13.849781, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'قصر خيار', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (83, 'آدم للحواسيب وتقنية المعلومات', 'السواني', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'السواني', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (86, 'محل اوال للهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.833992, 13.066304, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (90, 'محل كونكشن فور تيك لبيع الهاتف النقال والاجهزة الالكترونية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.894455, 13.20375, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (93, 'محل الاجهزة الذكية لبيع وصيانة الاجهزة الالكترونية', 'تاجوراء', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'تاجوراء', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (95, 'شركة الأنظمة - عين زارة', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (96, 'شركة تيبستي لاستيراد اجهزة الاتصالات والاجهزة الالكترونية', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (97, 'شركة التقنية لبيع الحاسب الالي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (99, 'محل سوف للالكترونات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (102, 'محل هاتف ليبيا', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (105, 'الشبكة للاتصالات والانترنت', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (116, 'عبد الهادي الحجاجي', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (117, 'عبدالرزاق عبدالسلام معروف', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (98, 'محل الجوال لبيع الهاتف المحمول', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', NULL, NULL, '912117650', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (101, 'الرائد لبيع الأجهزة الإلكترونية', 'تاجوراء', 'dealer', NULL, NULL, NULL, 'active', 32.871431, 13.344882, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'تاجوراء', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (103, 'المستقبل الزاهر', 'الزهراء', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزهراء', NULL, '913137703', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (104, 'البرق', 'مسلاتة', 'dealer', NULL, NULL, NULL, 'active', 32.579654, 14.038662, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'مسلاتة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (106, 'شركة البديل - المدار', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.867275, 13.214343, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '927725673', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (107, 'شركة البديل - الجرابة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.879554, 13.205815, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (109, 'شركة البديل - جنزور', 'جنزور', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'جنزور', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (110, 'شركة البديل - الفرناج', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.851298, 13.244611, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (111, 'شركة البديل - قرجي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.867274, 13.130432, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (112, 'شركة البديل - طريق الشوك', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.837037, 13.229123, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (113, 'شركة البديل - المأمون', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.894395, 13.173812, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (115, 'شركة البديل - قصر بن غشير', 'قصر بن غشير', 'dealer', NULL, NULL, NULL, 'active', 32.681706, 13.174957, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'قصر بن غشير', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (118, 'شركة البديل - مصراته', 'مصراتة', 'dealer', NULL, NULL, NULL, 'active', 32.376431, 15.078382, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'مصراتة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (119, 'شركة الوسائل للاتصالات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.872047, 13.150924, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (120, 'المعداني موبايل - الجفارة', 'الجفارة', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الجفارة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (121, 'محل الميعاذ', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.879704, 13.291846, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (122, 'شركة السفير للالكترونات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.867254, 13.130233, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (124, 'شركة البديل - الملكية مول', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.820178, 13.250104, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (125, 'شركة البديل - تاج مول', 'تاجوراء', 'dealer', NULL, NULL, NULL, 'active', 32.890957, 13.345253, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'تاجوراء', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (126, 'شركة البديل - ترهونة', 'ترهونة', 'dealer', NULL, NULL, NULL, 'active', 32.433081, 13.627947, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ترهونة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (127, 'شركة البديل - طبرق', 'طبرق', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طبرق', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (128, 'شركة البديل - اجدابيا', 'اجدابيا', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'اجدابيا', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (130, 'شركة المستقبل الرقمي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.842704, 13.06942, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (131, 'الانظمة الدقيقة - زناتة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.856543, 13.236348, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (132, 'شركة المنطق لاستيراد الاجهزة الالكترونية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.883558, 13.185322, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (133, 'نورالدين لبيع الهواتف', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.865598, 13.276401, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (134, 'شركة المستقبل الزاهر جنزور', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.820672, 13.036808, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (136, 'منتدى القصر', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.795742, 13.136839, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (137, 'فاضل 4 - العبابسة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.8382, 13.313286, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (138, 'شركة المسار المتميز للاتصالات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.846941, 13.132138, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (139, 'المعداني موبايل', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.678858, 12.995948, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (140, 'الياسمين موبايل', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.818662, 13.070214, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (141, 'البرق - طرابلس', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.579663, 14.03868, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (143, 'محل المصدر', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (144, 'أبناء الغاناي للألكترونات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.843851, 13.205193, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (145, 'مرسول السلام', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (146, 'محل المتألق الجديد', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.618551, 13.223681, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (386, 'آفاق المتجددة', '', 'dealer', NULL, NULL, NULL, 'active', 32.821414, 13.219223, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (387, 'شركة الريادة المتفوقة', '', 'dealer', NULL, NULL, NULL, 'active', 32.900124, 13.234398, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (388, 'محل الربيع المشرق', '', 'dealer', NULL, NULL, NULL, 'active', 32.822387, 13.339932, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (389, 'مركز المنتدى للحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.7567, 12.5683, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (390, 'محل ميعاد لبيع اجهزة الهاتف', '', 'dealer', NULL, NULL, NULL, 'active', 32.8794, 13.292, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (391, 'الوكيل المعتمد للهاتف المحمول', '', 'dealer', NULL, NULL, NULL, 'active', 26.643091, 13.6500072, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (148, 'ميلانو', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.758943, 12.91093, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (149, 'شركة المنطق', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.88356, 13.185212, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (150, 'محل ميجاهيرتز - طرابلس', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.824513, 13.032369, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (151, 'المتميز للألكترونات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.714237, 13.197314, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (152, 'مركز المهندس', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.597328, 13.174677, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (153, 'موبايلي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.678886, 13.098436, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (155, 'المنطلق - طرابلس', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.53354, 13.12128, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (156, 'المستقبل الزاهر - الزهراء', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.678419, 12.868352, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (157, 'منتدى القصر ولي العهد', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.795742, 13.136839, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (158, 'شركة المسار للاتصالات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.846941, 13.132138, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (159, 'الليث 2', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.86008, 13.09029, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (161, 'فاضل 1 - جامع ربئر الاسطي ميلاد', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.852418, 13.315314, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (162, 'فاضل 3 - البيفي محطة وقود الخبولي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.871017, 13.30612, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (163, 'شركة نافورة شمال افريقيا', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.849948, 13.170491, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (164, 'القمة للهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.847633, 13.291723, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (165, 'دبي ستور', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.81447, 13.039892, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (166, 'الوفاء موبايلي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.885345, 13.339167, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (167, 'الاتقان العالمية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.47066, 13.0506, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (169, 'فاضل - حي الاندلس', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.87384, 13.152125, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (170, 'جديد فون', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.785294, 13.34424, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (171, 'الهاني لبيع الهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.877144, 13.22435, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (172, 'شركة المحيط', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.49029, 13.12552, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (173, 'متجر الدقة للالكترونات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.883191, 13.274303, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (174, 'متجر أنس للهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '915050052', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (176, 'متجر تاج', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.877793, 13.392835, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (177, 'محل الاتقان 2 لبيع الاجهزة الالكترونية والهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.54109, 13.177338, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (178, 'محمد المناعي للهاتف المحمول', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.835031, 13.292018, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (179, 'شركة الشبكة العريقة لتقنية المعلومات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.820126, 13.22249, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '924008080', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (180, 'المتفوق للهاتف المحمول', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.754751, 13.013498, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (181, 'شنقير', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.42204, 13.04001, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '912111418', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (182, 'أفاق المتجددة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.821414, 13.21922, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (184, 'الريادة المتفوقة للاستيراد الاجهزة الالكترونية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.900124, 13.234398, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (185, 'القمة لبيع الهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.811667, 13.164762, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (186, 'التكنولوجيا الذكية لأنظمة الحماية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.827739, 13.005668, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (187, 'البطشة فون', 'ترهونة', 'dealer', NULL, NULL, NULL, 'active', 32.433401, 13.629605, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ترهونة', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (188, 'البداية للهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.776068, 13.015593, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (190, 'مركز الوفاء الأولي', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.87424, 13.340128, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (392, 'مركز حازم لخدمات لالحاسوب', '', 'dealer', NULL, NULL, NULL, 'active', 32.6983429, 13.8500449, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (393, 'شركة الاتقان العالمية', '', 'dealer', NULL, NULL, NULL, 'active', 32.785, 13.0506, NULL, '2026-05-06 19:18:16.491593+00', '2026-05-06 19:18:16.491593+00', '', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (1, 'شركة توتلايت للاتصالات والتقنية', 'ابوكماش', 'dealer', NULL, NULL, NULL, 'active', 33.077228, 11.734741, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'ابوكماش', NULL, '919369192', 'mkfftees@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (5, 'الجيل الرابع لبيع وصيانة الالكترونات-الزاوية', 'الزاوية', 'dealer', NULL, NULL, NULL, 'active', 32.776559, 12.713727, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'الزاوية', NULL, '914997757', 'falcon77aa@gmail.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (14, 'مركز الاثار للحاسب الألي', 'صبراته', 'dealer', NULL, NULL, NULL, 'active', 32.795405, 12.486307, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'صبراته', NULL, '925056918', 'rabea.libya@yahoo.com', NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (51, 'شركة البديل - البيضاء', 'البيضاء', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'البيضاء', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (54, 'شركة البديل - سبها', 'سبها', 'dealer', NULL, NULL, NULL, 'active', 27.03125, 14.439496, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'سبها', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (72, 'مكتب ابو خيط لخدمات الحاسوب', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.906355, 13.246029, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (80, 'دار المفيد لاستيراد الحاسوب والانظمة الالكترونية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.871054, 13.19795, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (94, 'محل المميز لبيع اجهزة النقال وكمالياته', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.819134, 13.262356, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (100, 'الأفق البعيد للإلكترونات', 'غير محدد', 'dealer', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 19:24:08.65+00', 'طرابلس', NULL, '917930240', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (108, 'شركة البديل - النصر', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.887082, 13.188514, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (114, 'شركة البديل - سوق الجمعة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.88272, 13.238771, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (123, 'شركة البديل - ستي مول', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.850925, 13.137655, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (129, 'شركة الظهرة للحاسبات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.890132, 13.192054, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (135, 'تشاركية برج السلام للاتصالات', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.8937, 13.17947, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (142, 'محل بهاء للهاتف المحمول', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.85161, 13.20311, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (147, 'المتداول الأول لبيع كروت دفع المسبق', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.839881, 13.182999, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (154, 'طرابلس لبيع الكروت', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.839248, 13.18262, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (160, 'فاضل 2 - محطة وقود الفصول الاربعة', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.84416, 13.303072, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (168, 'برج السلام للاتصالات الدولية والمحلية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.8937, 13.17947, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (175, 'أبعاد للتقنية والالكترونات وانظمة الحماية', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.783403, 13.235272, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '925192626', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (183, 'الربيع المشرق', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.49208, 13.20241, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, '913881233', NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);
INSERT INTO public.agents VALUES (189, 'الدقة الجديدة لبيع الهاتف النقال', 'طرابلس', 'dealer', NULL, NULL, NULL, 'active', 32.850235, 13.178815, NULL, '2026-05-06 15:36:24.992523+00', '2026-05-06 15:36:24.992523+00', 'طرابلس', NULL, NULL, NULL, NULL, 'agent_main', NULL, NULL, '[]', '{}', '{}', NULL);


ALTER TABLE public.agents ENABLE TRIGGER ALL;

--
-- Data for Name: agent_documents; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.agent_documents DISABLE TRIGGER ALL;



ALTER TABLE public.agent_documents ENABLE TRIGGER ALL;

--
-- Data for Name: agent_requests; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.agent_requests DISABLE TRIGGER ALL;

INSERT INTO public.agent_requests VALUES (1, 'LTT-20260504-AFE10D', 'Ahmed Esaa', 'a.esaa@ltt.ly', 'محل الأمل', '0912345678', 'طرابلس', 'main', 32.9, 13.18, 'شارع الرشيد', true, true, 'good', 4, 'high', true, true, 'موقع ممتاز', 96, 92, 100, 96, 'pending', '2026-05-04 10:36:30.958512+00', '2026-05-04 10:36:30.958512+00', NULL, NULL, NULL, 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'agent', NULL, '[]');
INSERT INTO public.agent_requests VALUES (2, 'LTT-20260504-134AEF', 'Ahmed', 'Ahmed@ltt.ly', 'test', '09', 'x', 'main', NULL, NULL, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 27, 53, 0, 29, 'pending', '2026-05-04 10:36:31.328983+00', '2026-05-04 10:36:31.328983+00', NULL, NULL, NULL, 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'agent', NULL, '[]');
INSERT INTO public.agent_requests VALUES (3, 'LTT-20260504-18FC3A', 'Ahmed Esaa', 'a.esaa@ltt.ly', 'محل النور للاتصالات', '0912345678', 'طرابلس', 'pos_adsl_4g', 32.902, 13.18, NULL, true, true, 'good', 4, 'high', true, true, 'موقع ممتاز في قلب المدينة', 96, 100, 100, 98, 'pending', '2026-05-04 14:23:00.065467+00', '2026-05-04 14:23:00.065467+00', '021234567', 'nour@example.com', 'شارع الرشيد، بجانب بنك الجمهورية', 3, 0, 400, 600, '[]', '[]', '[]', NULL, 'agent', NULL, '[]');
INSERT INTO public.agent_requests VALUES (4, 'LTT-20260506-C80D10', 'Yazeed Rahuma', 'y.rahuma@ltt.ly', 'شركة توتلايت للاتصالات والتقنية', '919369192', 'ابوكماش', 'agent_main', 33.077228, 11.734741, '', true, true, 'good', 5, 'high', true, true, 'good', 100, 73, 100, 91, 'approved', '2026-05-06 15:28:08.319532+00', '2026-05-06 15:28:56.11659+00', '', 'mkfftees@gmail.com', '', 0, 0, 20, 20, '["/api/agent-request/uploads/1778081288308-76e63ea246c7.png"]', '["/api/agent-request/uploads/1778081288309-56006ea90672.png"]', '["/api/agent-request/uploads/1778081288309-da7ccdb52ab8.png"]', 1, 'agent', NULL, '[]');
INSERT INTO public.agent_requests VALUES (5, 'LTT-20260506-B04899', 'أحمد التجريبي', 'أحمد.التجريبي@ltt.ly', 'نقطة بيع مطار معيتيقة', '0911111111', 'طرابلس', NULL, 32.905696, 13.273555, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'pending', '2026-05-06 18:31:34.412004+00', '2026-05-06 18:31:34.412004+00', NULL, NULL, 'مطار معيتيقة', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'fixed_pos', NULL, '["ADSL", "4G"]');
INSERT INTO public.agent_requests VALUES (8, 'LTT-SC-001', 'نظام', 'system@ltt.ly', 'مركز خدمات غرب طرابلس', '0910000001', 'طرابلس', NULL, 32.84333929, 13.06906152, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, '', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (9, 'LTT-SC-002', 'نظام', 'system@ltt.ly', 'مركز خدمات الزاوية', '0910000002', 'الزاوية', NULL, 32.76599097, 12.73618057, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, '', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (10, 'LTT-SC-003', 'نظام', 'system@ltt.ly', 'مركز خدمات غريان', '0910000003', 'غريان', NULL, 32.17003923, 13.00607412, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, '', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (11, 'LTT-SC-004', 'نظام', 'system@ltt.ly', 'مركز خدمات جنوب طرابلس', '0910000004', 'طرابلس', NULL, 32.83905969, 13.14877326, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, '', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (12, 'LTT-SC-005', 'نظام', 'system@ltt.ly', 'مركز خدمات شارع الزاوية', '0910000005', 'طرابلس', NULL, 32.87278696, 13.1905898, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, 'شارع الزاوية', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (13, 'LTT-SC-006', 'نظام', 'system@ltt.ly', 'مركز خدمات كبار العملاء', '0910000006', 'طرابلس', NULL, 32.8920476, 13.16715321, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, 'برج طرابلس', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', NULL, '[]');
INSERT INTO public.agent_requests VALUES (14, 'LTT-FP-001', 'نظام', 'system@ltt.ly', 'نقطة بيع مطار معيتيقة', '0910000010', 'طرابلس', NULL, 32.905696, 13.273555, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'approved', '2026-05-06 18:56:30.624321+00', '2026-05-06 18:56:30.624321+00', NULL, NULL, 'مطار معيتيقة الدولي', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'fixed_pos', NULL, '[]');
INSERT INTO public.agent_requests VALUES (6, 'LTT-20260506-FFDAC3', 'جلال التلوع', 'جلال.التلوع@ltt.ly', 'جلال', '0915200410', 'طرابلس', NULL, NULL, NULL, NULL, true, true, 'good', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'cancelled', '2026-05-06 18:38:05.670513+00', '2026-05-06 18:57:08.87829+00', NULL, NULL, 'طرابلس', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'mobile_van', 1, '[]');
INSERT INTO public.agent_requests VALUES (7, 'LTT-20260506-BED43D', 'أحمد علي', 'أحمد.علي@ltt.ly', 'مركز خدمة جنزور (محدّث)', '0911234567', 'جنزور', NULL, 32.8872, 13.1913, NULL, false, false, 'medium', 3, 'medium', false, false, NULL, 0, 0, 0, 0, 'cancelled', '2026-05-06 18:45:05.749966+00', '2026-05-06 18:58:15.118111+00', NULL, NULL, 'شارع الشط', 0, 0, 0, 0, '[]', '[]', '[]', NULL, 'service_center', 3, '["ADSL", "4G"]');


ALTER TABLE public.agent_requests ENABLE TRIGGER ALL;

--
-- Data for Name: agent_scores; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.agent_scores DISABLE TRIGGER ALL;



ALTER TABLE public.agent_scores ENABLE TRIGGER ALL;

--
-- Data for Name: document_history; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.document_history DISABLE TRIGGER ALL;



ALTER TABLE public.document_history ENABLE TRIGGER ALL;

--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.inspections DISABLE TRIGGER ALL;



ALTER TABLE public.inspections ENABLE TRIGGER ALL;

--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.inventory DISABLE TRIGGER ALL;

INSERT INTO public.inventory VALUES (1, 'شرائح SIM عادية', 'sim_cards', 2500, 500, 'شريحة', '{}', NULL, '2026-05-04 09:19:17.725628+00', '2026-05-04 09:19:17.725628+00');
INSERT INTO public.inventory VALUES (2, 'شرائح SIM 4G', 'sim_cards', 180, 200, 'شريحة', '{}', NULL, '2026-05-04 09:19:18.98918+00', '2026-05-04 09:19:18.98918+00');
INSERT INTO public.inventory VALUES (3, 'كروت شحن 5 دينار', 'recharge_cards', 3200, 1000, 'كرت', '{}', NULL, '2026-05-04 09:19:20.419192+00', '2026-05-04 09:19:20.419192+00');
INSERT INTO public.inventory VALUES (4, 'كروت شحن 10 دينار', 'recharge_cards', 1850, 800, 'كرت', '{}', NULL, '2026-05-04 09:19:21.845541+00', '2026-05-04 09:19:21.845541+00');
INSERT INTO public.inventory VALUES (5, 'كروت شحن 20 دينار', 'recharge_cards', 950, 500, 'كرت', '{}', NULL, '2026-05-04 09:19:23.20843+00', '2026-05-04 09:19:23.20843+00');
INSERT INTO public.inventory VALUES (6, 'راوتر ADSL', 'devices', 45, 20, 'جهاز', '{}', NULL, '2026-05-04 09:19:27.192084+00', '2026-05-04 09:19:27.192084+00');
INSERT INTO public.inventory VALUES (7, 'راوتر FTTH', 'ftth_equipment', 12, 15, 'جهاز', '{}', NULL, '2026-05-04 09:19:28.338749+00', '2026-05-04 09:19:28.338749+00');
INSERT INTO public.inventory VALUES (8, 'سبليتر ADSL', 'accessories', 380, 100, 'قطعة', '{}', NULL, '2026-05-04 09:19:31.892169+00', '2026-05-04 09:19:31.892169+00');
INSERT INTO public.inventory VALUES (9, 'كابل شبكة (متر)', 'accessories', 250, 200, 'متر', '{}', NULL, '2026-05-04 09:19:33.296029+00', '2026-05-04 09:19:33.296029+00');
INSERT INTO public.inventory VALUES (10, 'موزع USB', 'accessories', 85, 50, 'قطعة', '{}', NULL, '2026-05-04 09:19:34.993143+00', '2026-05-04 09:19:34.993143+00');


ALTER TABLE public.inventory ENABLE TRIGGER ALL;

--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.notifications DISABLE TRIGGER ALL;



ALTER TABLE public.notifications ENABLE TRIGGER ALL;

--
-- Data for Name: sales_logs; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sales_logs DISABLE TRIGGER ALL;



ALTER TABLE public.sales_logs ENABLE TRIGGER ALL;

--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.tickets DISABLE TRIGGER ALL;

INSERT INTO public.tickets VALUES (1, 'عطل في نقطة بيع طرابلس المركزي', 'انقطاع مفاجئ في خدمة الإنترنت لدى المركز', 'open', 'critical', 'technical', 1, NULL, NULL, NULL, '2026-05-04 09:20:45.692046+00', '2026-05-04 09:20:45.692046+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (2, 'مخزون شرائح SIM منخفض', 'تحتاج منطقة جنزور لتجديد مخزون شرائح SIM 4G بشكل عاجل', 'open', 'high', 'stock', 3, NULL, NULL, NULL, '2026-05-04 09:20:46.924972+00', '2026-05-04 09:20:46.924972+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (3, 'تقرير مبيعات مشبوه - وكيل مصراتة', 'فارق كبير بين المبيعات المُبلَّغ عنها والمبيعات الفعلية الملاحظة', 'in_progress', 'high', 'compliance', 2, NULL, NULL, NULL, '2026-05-04 09:20:48.532107+00', '2026-05-04 09:20:48.532107+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (4, 'طلب تفعيل خدمة FTTH', 'وكيل العجيلات يطلب تفعيل خدمة الألياف الضوئية', 'open', 'medium', 'technical', 1, NULL, NULL, NULL, '2026-05-04 09:20:49.752521+00', '2026-05-04 09:20:49.752521+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (5, 'تسوية مالية معلقة', 'تسوية حساب كروت الشحن لشهر أبريل لم تُنجز', 'in_progress', 'medium', 'billing', 2, NULL, NULL, NULL, '2026-05-04 09:20:51.22888+00', '2026-05-04 09:20:51.22888+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (6, 'شكوى عميل - سوق الجمعة', 'عميل يشكو من جودة خدمة الإنترنت في منطقة سوق الجمعة', 'resolved', 'low', 'technical', 3, NULL, NULL, NULL, '2026-05-04 09:20:52.516726+00', '2026-05-04 09:20:52.516726+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (7, 'تحديث بيانات عقد الوكيل', 'تحديث معلومات العقد لوكيل تاجوراء', 'closed', 'low', 'other', 1, NULL, NULL, NULL, '2026-05-04 09:20:53.71747+00', '2026-05-04 09:20:53.71747+00', NULL, NULL, NULL);
INSERT INTO public.tickets VALUES (8, 'جولة تفتشية', 'الذهاب الي وكيل', 'open', 'medium', 'technical', 1, 1, NULL, NULL, '2026-05-06 18:47:13.073213+00', '2026-05-06 18:47:13.073213+00', '555555', 32.901232, 13.220427);
INSERT INTO public.tickets VALUES (9, 'إنشاء وكيل جديد', 'الذهاب الي طالب وكالة', 'open', 'medium', 'other', 1, 1, NULL, NULL, '2026-05-06 19:10:33.380287+00', '2026-05-06 19:10:33.380287+00', NULL, 32.418927, 12.762451);


ALTER TABLE public.tickets ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

INSERT INTO public.users VALUES (1, 'Yazeed Rahuma', 'y.rahuma@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'head_of_unit', 'قسم مبيعات الأفراد', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (2, 'Mohamed Eshtiewi', 'm.eshtiwe@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'indirect_sales', 'المبيعات غير المباشرة', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (3, 'Seraj Zawia', 's.zawia@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'agent_affairs', 'شؤون الوكلاء', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (4, 'Jamal Oun', 'j.oun@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'agent_affairs', 'شؤون الوكلاء', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (5, 'Mohammed Butota', 'm.butota@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (6, 'Milad Kashoun', 'm.kashoun@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (7, 'Abdul Momen Zober', 'a.zober@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (8, 'Ahmed Esaa', 'a.esaa@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (9, 'Esra Abugriss', 'e.abugriss@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (10, 'Fadel Elgherwi', 'f.elgherwi@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'technical_support', 'الدعم الفني', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (11, 'Feras Bashir', 'f.bashir@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'technical_support', 'الدعم الفني', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (12, 'Hassan Joma', 'h.joma@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'inspection_team', 'فريق التفتيش', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (13, 'Jalal Khalifa', 'j.khalifa@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'technical_support', 'الدعم الفني', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (14, 'Mohamed Adel', 'm.adel@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'indirect_sales', 'المبيعات غير المباشرة', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (15, 'Mohamed Doban', 'm.doban@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'airport_team', 'فريق المطار', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (16, 'Mohamed Jarallah', 'm.jarallah@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'centers_support', 'دعم المراكز', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (17, 'Munir Kosha', 'm.kosha@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'indirect_sales', 'المبيعات غير المباشرة', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (18, 'Nabil Almeshri', 'n.almeshri@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'centers_support', 'دعم المراكز', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (19, 'Moad Alamory', 'm.alamory@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'indirect_sales', 'المبيعات غير المباشرة', true, '2026-05-04 09:12:28.096021+00', '2026-05-04 09:12:28.096021+00');
INSERT INTO public.users VALUES (20, 'admin', 'admin@ltt.ly', '24864137a98b426c6b737596e46c1d6de53213a0f0cd13b6f994c0a461fbb221', 'admin', NULL, true, '2026-05-06 19:30:14.097027+00', '2026-05-06 19:30:14.097027+00');


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Name: agent_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agent_documents_id_seq', 1, false);


--
-- Name: agent_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agent_requests_id_seq', 14, true);


--
-- Name: agent_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agent_scores_id_seq', 13, true);


--
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agents_id_seq', 393, true);


--
-- Name: document_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_history_id_seq', 1, false);


--
-- Name: inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inspections_id_seq', 1, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 10, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: sales_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_logs_id_seq', 1, false);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tickets_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 9rUQG6cWjm5ljfhIXchXHIpprR5obmzQXMhWrdyFdHPtxfxvbBdTwPnyb0s0j2y

