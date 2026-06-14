--
-- PostgreSQL database dump
--

\restrict Uz0p0LD9auIOaNlWnH84Q4iSRMeH6maUmP3mCFyGT0kpgDDNCAvuQ8Hh8H6ECkD

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_settings_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas (
    id character varying(50) NOT NULL,
    city_id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.areas OWNER TO postgres;

--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id character varying(100) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- Name: driver_payment_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_payment_slips (
    id character varying(100) NOT NULL,
    driver_name character varying(255) NOT NULL,
    date timestamp without time zone NOT NULL,
    item_count integer DEFAULT 0,
    order_ids text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_payment_slips OWNER TO postgres;

--
-- Name: driver_return_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_return_slips (
    id character varying(100) NOT NULL,
    driver_name character varying(255) NOT NULL,
    date timestamp without time zone NOT NULL,
    item_count integer DEFAULT 0,
    order_ids text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_return_slips OWNER TO postgres;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id character varying(255) NOT NULL,
    is_online boolean DEFAULT false,
    current_latitude numeric(10,8),
    current_longitude numeric(11,8),
    last_location_update timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: TABLE drivers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.drivers IS 'Driver real-time location and status';


--
-- Name: merchant_payment_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.merchant_payment_slips (
    id character varying(100) NOT NULL,
    merchant_name character varying(255) NOT NULL,
    date timestamp without time zone NOT NULL,
    item_count integer DEFAULT 0,
    status character varying(100) DEFAULT 'جاهز للتسليم'::character varying,
    order_ids text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.merchant_payment_slips OWNER TO postgres;

--
-- Name: merchant_return_slips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.merchant_return_slips (
    id character varying(100) NOT NULL,
    merchant character varying(255) NOT NULL,
    date timestamp without time zone NOT NULL,
    items integer DEFAULT 0,
    status character varying(100) DEFAULT 'جاهز للتسليم'::character varying,
    order_ids text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.merchant_return_slips OWNER TO postgres;

--
-- Name: order_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_audit_logs (
    id integer NOT NULL,
    order_id character varying(50) NOT NULL,
    actor_id character varying(50) NOT NULL,
    actor_name character varying(100),
    actor_role character varying(50),
    action character varying(50) NOT NULL,
    previous_status character varying(50),
    new_status character varying(50),
    outcome character varying(20) NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_audit_logs OWNER TO postgres;

--
-- Name: order_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_audit_logs_id_seq OWNER TO postgres;

--
-- Name: order_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_audit_logs_id_seq OWNED BY public.order_audit_logs.id;


--
-- Name: order_settlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_settlements (
    id integer NOT NULL,
    order_id character varying(100),
    cod_collected numeric(12,2) DEFAULT 0,
    company_share numeric(12,2) DEFAULT 0,
    driver_share numeric(12,2) DEFAULT 0,
    merchant_share numeric(12,2) DEFAULT 0,
    rto_fee numeric(12,2) DEFAULT 0,
    status character varying(50) DEFAULT 'pending'::character varying,
    settled_at timestamp without time zone,
    settled_by character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_settlements OWNER TO postgres;

--
-- Name: order_settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_settlements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_settlements_id_seq OWNER TO postgres;

--
-- Name: order_settlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_settlements_id_seq OWNED BY public.order_settlements.id;


--
-- Name: order_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_tracking (
    id integer NOT NULL,
    order_id character varying(100),
    driver_latitude numeric(10,8),
    driver_longitude numeric(11,8),
    status character varying(100),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_tracking OWNER TO postgres;

--
-- Name: TABLE order_tracking; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.order_tracking IS 'GPS tracking history for orders';


--
-- Name: order_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_tracking_id_seq OWNER TO postgres;

--
-- Name: order_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_tracking_id_seq OWNED BY public.order_tracking.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id character varying(100) NOT NULL,
    order_number integer NOT NULL,
    source character varying(50) DEFAULT 'Manual'::character varying,
    reference_number character varying(255),
    recipient character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    whatsapp character varying(50),
    address text NOT NULL,
    city character varying(100) NOT NULL,
    region character varying(255),
    status character varying(100) DEFAULT 'بالانتظار'::character varying,
    previous_status character varying(100) DEFAULT ''::character varying,
    driver character varying(255),
    merchant character varying(255),
    cod numeric(10,2) DEFAULT 0,
    item_price numeric(10,2) DEFAULT 0,
    delivery_fee numeric(10,2) DEFAULT 1.5,
    additional_cost numeric(10,2) DEFAULT 0,
    driver_fee numeric(10,2) DEFAULT 1.0,
    driver_additional_fare numeric(10,2) DEFAULT 0,
    date date,
    notes text,
    lat numeric(10,8),
    lng numeric(11,8),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    previous_driver character varying
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: TABLE orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.orders IS 'Main orders table for delivery tracking';


--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    city_id character varying(100)
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    user_count integer DEFAULT 0,
    permissions text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    checksum character varying(64)
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    company_id integer DEFAULT 1,
    settings_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    updated_by character varying(255)
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: TABLE settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.settings IS 'Stores all application settings including notifications, orders, login, regional, UI, policy, menu visibility, and AI agent settings';


--
-- Name: COLUMN settings.settings_data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.settings_data IS 'JSONB column containing all settings data for flexible schema';


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statuses (
    id character varying(100) NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(100) DEFAULT 'Circle'::character varying,
    color character varying(20) DEFAULT '#607D8B'::character varying,
    is_active boolean DEFAULT true,
    reason_codes text[] DEFAULT '{}'::text[],
    set_by_roles text[] DEFAULT '{}'::text[],
    visible_to jsonb DEFAULT '{"admin": true, "driver": true, "merchant": true}'::jsonb,
    permissions jsonb DEFAULT '{}'::jsonb,
    flow jsonb DEFAULT '{}'::jsonb,
    triggers jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.statuses OWNER TO postgres;

--
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    id character varying(100) NOT NULL,
    user_id character varying(255),
    name character varying(255) NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    html text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.templates OWNER TO postgres;

--
-- Name: TABLE templates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.templates IS 'Stores user-defined templates for policies, reports, and tables';


--
-- Name: COLUMN templates.settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.templates.settings IS 'JSONB storing template configuration like fonts, colors, fields, etc.';


--
-- Name: COLUMN templates.html; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.templates.html IS 'Generated HTML content of the template';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    store_name character varying(255),
    role_id character varying(100) NOT NULL,
    avatar text DEFAULT ''::text,
    whatsapp character varying(50),
    price_list_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: order_audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.order_audit_logs_id_seq'::regclass);


--
-- Name: order_settlements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_settlements ALTER COLUMN id SET DEFAULT nextval('public.order_settlements_id_seq'::regclass);


--
-- Name: order_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_tracking ALTER COLUMN id SET DEFAULT nextval('public.order_tracking_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id, city_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, name) FROM stdin;
CITY_AMM	عمان
CITY_IRB	إربد
CITY_ZAR	الزرقاء
CITY_AQA	العقبة
CITY_SLT	السلط
CITY_MDB	مادبا
CITY_KAR	الكرك
CITY_JER	جرش
CITY_AJL	عجلون
CITY_MAA	معان
CITY_TAF	الطفيلة
CITY_MAF	المفرق
CITY_WAD	وادي عربة
CITY_AZR	الازرق
CITY_AGH	الاغوار
CITY_DES	طريق الصحراوي
CITY_BLQ	البلقاء
CITY_PET	البتراء
CITY_RAM	الرمثا
CITY_SHO	الشوبك
CITY_MOW	الموقر
\.


--
-- Data for Name: driver_payment_slips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_payment_slips (id, driver_name, date, item_count, order_ids, created_at) FROM stdin;
\.


--
-- Data for Name: driver_return_slips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_return_slips (id, driver_name, date, item_count, order_ids, created_at) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, is_online, current_latitude, current_longitude, last_location_update, created_at) FROM stdin;
\.


--
-- Data for Name: merchant_payment_slips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.merchant_payment_slips (id, merchant_name, date, item_count, status, order_ids, created_at) FROM stdin;
\.


--
-- Data for Name: merchant_return_slips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.merchant_return_slips (id, merchant, date, items, status, order_ids, created_at) FROM stdin;
\.


--
-- Data for Name: order_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_audit_logs (id, order_id, actor_id, actor_name, actor_role, action, previous_status, new_status, outcome, reason, created_at) FROM stdin;
1	ORD-15	user-salahwh	salahwh	admin	change_status	مؤجل	ملغي	success	\N	2026-06-05 06:13:14.398388
2	ORD-15	user-salahwh	salahwh	admin	change_status	ملغي	مرجع للفرع	success	\N	2026-06-05 06:13:24.899748
3	ORD-15	user-salahwh	salahwh	admin	change_status	مرجع للفرع	مكتمل	success	\N	2026-06-05 06:14:07.898555
4	ORD-15	user-salahwh	salahwh	admin	change_status	مكتمل	مؤرشف	success	\N	2026-06-05 06:18:35.32985
5	ORD-4	user-salahwh	salahwh	admin	update	بانتظار السائق	بانتظار السائق	success	\N	2026-06-05 06:41:07.825378
\.


--
-- Data for Name: order_settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_settlements (id, order_id, cod_collected, company_share, driver_share, merchant_share, rto_fee, status, settled_at, settled_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_tracking (id, order_id, driver_latitude, driver_longitude, status, recorded_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, source, reference_number, recipient, phone, whatsapp, address, city, region, status, previous_status, driver, merchant, cod, item_price, delivery_fee, additional_cost, driver_fee, driver_additional_fare, date, notes, lat, lng, created_at, updated_at, previous_driver) FROM stdin;
ORD-9	9	Manual	\N	أحمد محمود	0791234576	\N	عبدون	عمان	عبدون	جاري التوصيل		محمد سويد	Brands of less	80.50	79.00	1.50	0.00	1.00	0.00	2024-07-10	55	\N	\N	2025-12-11 15:54:38.260057	2025-12-16 02:36:04.287065	\N
ORD-14	14	Manual	\N	فاطمة علي	0791234581	\N	الصويفية	عمان	الصويفية	تم التوصيل		ابو العبد	جنان صغيرة	105.50	104.00	1.50	0.00	1.00	0.00	2024-07-15	تم 	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 09:33:35.165753	\N
ORD-6	6	Manual	\N	فاطمة علي	0791234573	\N	الصويفية	عمان	الصويفية	تم التوصيل		محمد سويد	جنان صغيرة	65.50	64.00	1.50	0.00	1.00	0.00	2024-07-07	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 10:07:36.944125	\N
ORD-2	2	Manual	2	فاطمة علي	0791234569	\N	الصويفية	عمان	الصويفية	بانتظار السائق	تم التوصيل	محمد سويد	جنان صغيرة	45.50	44.00	1.50	0.00	1.00	0.00	2025-12-15	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-17 00:23:20.175695	\N
ORD-20	20	Manual	\N	محمد جاسم	0791234587	\N	تلاع العلي	عمان	تلاع العلي	بالانتظار		\N	جنان صغيرة	135.50	134.00	1.50	0.00	1.00	0.00	2024-07-21	م	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:39:55.89949	ابو العبد
ORD-3	3	Manual		خالد وليد	0791234570	\N	خلدا	عمان	خلدا	بانتظار السائق	مؤجل	ابو العبد	Brands of less	50.50	49.00	1.50	0.00	1.00	0.00	2025-12-10	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-17 00:23:22.086177	\N
ORD-11	11	Manual	\N	خالد وليد	0791234578	\N	خلدا	عمان	خلدا	مؤجل		محمد سويد	Brands of less	90.50	89.00	1.50	0.00	1.00	0.00	2024-07-12	نعم 	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 09:32:26.622838	\N
ORD-5	5	Manual	\N	أحمد محمود	0791234572	\N	عبدون	عمان	عبدون	بانتظار السائق	جاري التوصيل	ابو العبد	Brands of less	60.50	59.00	1.50	0.00	1.00	0.00	2024-07-06	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 10:07:41.629703	\N
ORD-17	17	Manual	\N	أحمد محمود	0791234584	\N	عبدون	عمان	عبدون	جاري التوصيل		محمد سويد	Brands of less	120.50	119.00	1.50	0.00	1.00	0.00	2024-07-18	تم	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 10:07:31.721743	\N
ORD-18	18	Manual	\N	فاطمة علي	0791234585	\N	الصويفية	عمان	الصويفية	تم التوصيل		ابو العبد	جنان صغيرة	125.50	124.00	1.50	0.00	1.00	0.00	2024-07-19	نم	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 10:07:33.275046	\N
ORD-7	7	Manual	\N	خالد وليد	0791234574	\N	خلدا	عمان	خلدا	بانتظار السائق	بانتظار السائق	محمد سويد	Brands of less	70.50	69.00	1.50	0.00	1.00	0.00	2024-07-08	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 10:07:43.024064	\N
ORD-21	21	Manual	123333	بينيتب 	0790267503		سحاب, عمان	عمان	سحاب	جاري التوصيل	بانتظار السائق	ابو العبد	جنان صغيرة	30.00	30.00	2.50	0.00	1.00	0.00	2025-12-16	(عدد الطرود: 1)	\N	\N	2025-12-17 00:00:45.844947	2025-12-17 00:24:21.601437	\N
ORD-13	13	Manual	\N	أحمد محمود	0791234580	\N	عبدون	عمان	عبدون	تم التوصيل	تم التوصيل	محمد سويد	Brands of less	100.50	99.00	1.50	0.00	1.00	0.00	2024-07-14	تم 	\N	\N	2025-12-11 15:54:38.260057	2025-12-12 17:31:22.5706	\N
ORD-1	1	Manual	1	أحمد محمود	0791234568	\N	عبدون	عمان	عبدون	بانتظار السائق	جاري التوصيل	محمد سويد	Brands of less	40.50	39.00	1.50	0.00	1.00	0.00	2025-12-08	م	\N	\N	2025-12-11 15:54:38.260057	2025-12-17 00:22:55.05265	\N
ORD-10	10	Manual	\N	فاطمة عليب	0791234577	\N	الصويفية	عمان	الصويفية	تم التوصيل		ابو العبد	جنان صغيرة	85.50	84.00	1.50	0.00	3.00	0.00	2024-07-11	تمر	\N	\N	2025-12-11 15:54:38.260057	2025-12-13 00:49:00.847646	\N
ORD-22	22	Manual		احمد فارس	0790264750		الطيبة - البتراء، البتراء	البتراء	الطيبة - البتراء	بانتظار السائق	بالانتظار	محمد سويد	Stress Killer	30.00	27.00	3.00	0.00	1.50	0.00	2026-06-04		\N	\N	2026-06-05 01:01:42.14723	2026-06-05 01:10:03.186034	\N
ORD-19	19	Manual	\N	خالد وليد	0791234586	\N	خلدا	عمان	خلدا	مكتمل	مرجع للتاجر	\N	Brands of less	130.50	129.00	1.50	0.00	1.00	0.00	2024-07-20	م	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:32:32.88889	محمد سويد
ORD-15	15	Manual	\N	خالد وليد	0791234582	\N	خلدا	عمان	خلدا	مؤرشف	مكتمل	\N	Brands of less	110.50	109.00	1.50	0.00	1.00	0.00	2024-07-16	بلب	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:32:32.88889	محمد سويد
ORD-12	12	Manual	\N	محمد جاسم	0791234579	\N	تلاع العلي	عمان	تلاع العلي	بالانتظار		\N	جنان صغيرة	95.50	94.00	1.50	0.00	1.00	0.00	2024-07-13	تم 	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:39:55.89949	ابو العبد
ORD-16	16	Manual	\N	محمد جاسم	0791234583	\N	تلاع العلي	عمان	تلاع العلي	بالانتظار		\N	جنان صغيرة	115.50	114.00	1.50	0.00	1.00	0.00	2024-07-17	تم العمل بنجاح 	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:39:55.89949	ابو العبد
ORD-8	8	Manual		محمد جاسم	0791234575	\N	تلاع العلي	عمان	تلاع العلي	بالانتظار		\N	جنان صغيرة	75.50	74.00	1.50	0.00	1.00	0.00	2024-07-09	م	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:39:55.89949	ابو العبد
ORD-4	4	Manual	\N	محمد جاسم	0791234571	\N	تلاع العلي	عمان	تلاع العلي	بانتظار السائق	بالانتظار	ابو العبد	جنان صغيرة	55.50	54.00	1.50	0.00	1.00	0.00	2024-07-05	م	\N	\N	2025-12-11 15:54:38.260057	2026-06-05 06:41:07.820385	\N
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, name, city_id) FROM stdin;
REG_AMM_001	تلاع العلي	CITY_AMM
REG_AMM_002	عبدون	CITY_AMM
REG_AMM_003	الصويفية	CITY_AMM
REG_AMM_004	دابوق	CITY_AMM
REG_AMM_005	خلدا	CITY_AMM
REG_AMM_006	الجاردنز	CITY_AMM
REG_AMM_007	مرج الحمام	CITY_AMM
REG_AMM_008	الجبيهة	CITY_AMM
REG_AMM_009	أم أذينة	CITY_AMM
REG_AMM_010	الرابية	CITY_AMM
REG_AMM_011	ضاحية الرشيد	CITY_AMM
REG_AMM_012	حي نزال	CITY_AMM
REG_AMM_013	الهاشمي الشمالي	CITY_AMM
REG_AMM_014	طبربور	CITY_AMM
REG_AMM_015	المدينة الرياضية	CITY_AMM
REG_AMM_016	العبدلي	CITY_AMM
REG_AMM_017	جبل عمان	CITY_AMM
REG_AMM_018	جبل اللويبدة	CITY_AMM
REG_AMM_019	وادي السير	CITY_AMM
REG_AMM_020	البيادر	CITY_AMM
REG_AMM_021	شفا بدران	CITY_AMM
REG_AMM_022	أبو نصير	CITY_AMM
REG_AMM_023	المقابلين	CITY_AMM
REG_AMM_024	أم السماق	CITY_AMM
REG_AMM_025	ضاحية الياسمين	CITY_AMM
REG_AMM_026	الذهيبة الشرقية	CITY_AMM
REG_AMM_027	الذهيبة الغربية	CITY_AMM
REG_AMM_028	ماركا	CITY_AMM
REG_AMM_029	النصر	CITY_AMM
REG_AMM_030	بدر الجديدة	CITY_AMM
REG_AMM_031	ابو علندا	CITY_AMM
REG_AMM_032	ام نواره	CITY_AMM
REG_AMM_033	جبل الحسين	CITY_AMM
REG_AMM_034	جبل القصور	CITY_AMM
REG_AMM_035	جبل النزهه	CITY_AMM
REG_AMM_037	راس العين	CITY_AMM
REG_AMM_038	وسط البلد	CITY_AMM
REG_AMM_039	ضاحية الاقصي	CITY_AMM
REG_AMM_040	الديار	CITY_AMM
REG_AMM_041	الرقيم	CITY_AMM
REG_AMM_042	الهاشمي الجنوبي	CITY_AMM
REG_AMM_043	جبل النظيف	CITY_AMM
REG_AMM_044	جبل التاج	CITY_AMM
REG_AMM_045	الاشرفية	CITY_AMM
REG_AMM_046	الذراع الغربي	CITY_AMM
REG_AMM_047	المنارة	CITY_AMM
REG_AMM_048	جبل المريخ	CITY_AMM
REG_AMM_049	سحاب	CITY_AMM
REG_AMM_050	الجيزة	CITY_AMM
REG_AMM_051	القسطل	CITY_AMM
REG_AMM_052	ناعور	CITY_AMM
REG_AMM_053	الموقر	CITY_AMM
REG_AMM_054	صافوط	CITY_AMM
REG_AMM_055	الرينبو	CITY_AMM
REG_AMM_057	ضاحية الأمير حسن	CITY_AMM
REG_AMM_058	العلكوميه	CITY_AMM
REG_AMM_059	ابو السوس	CITY_AMM
REG_AMM_060	ابو عليا	CITY_AMM
REG_AMM_061	استقلال مول	CITY_AMM
REG_AMM_062	اسكان الكهرباء	CITY_AMM
REG_AMM_063	اسكان المالية	CITY_AMM
REG_AMM_064	اسكان ماركا	CITY_AMM
REG_AMM_065	اشارة الارسال	CITY_AMM
REG_AMM_066	اشارة الغاز	CITY_AMM
REG_AMM_067	الاستقلال	CITY_AMM
REG_AMM_068	البقعة	CITY_AMM
REG_AMM_069	البنك المركزي	CITY_AMM
REG_AMM_070	البنيات	CITY_AMM
REG_AMM_071	البيضا	CITY_AMM
REG_AMM_072	التطوير الحضري	CITY_AMM
REG_AMM_073	الجسور العشرة	CITY_AMM
REG_AMM_074	الجمرك	CITY_AMM
REG_AMM_075	الجندويل	CITY_AMM
REG_AMM_076	الجويدة	CITY_AMM
REG_AMM_077	الحي الشرقي-عمان	CITY_AMM
REG_AMM_078	الخزنة	CITY_AMM
REG_AMM_079	الخشافية	CITY_AMM
REG_AMM_080	الدوار الاول	CITY_AMM
REG_AMM_081	الدوار الثالث	CITY_AMM
REG_AMM_082	الدوار الثامن	CITY_AMM
REG_AMM_083	الدوار الثاني	CITY_AMM
REG_AMM_084	الدوار الخامس	CITY_AMM
REG_AMM_085	الدوار الرابع	CITY_AMM
REG_AMM_086	الدوار السابع	CITY_AMM
REG_AMM_087	الدوار السادس	CITY_AMM
REG_AMM_089	الرجيم	CITY_AMM
REG_AMM_090	الرحمانية	CITY_AMM
REG_AMM_091	الروابي	CITY_AMM
REG_AMM_092	الرونق	CITY_AMM
REG_AMM_093	السوق المركزي	CITY_AMM
REG_AMM_094	الشرق الاوسط	CITY_AMM
REG_AMM_095	الشميساني	CITY_AMM
REG_AMM_096	الطنيب	CITY_AMM
REG_AMM_097	الطيبة - عمان	CITY_AMM
REG_AMM_098	الظهير	CITY_AMM
REG_AMM_099	الغباوي-عمان	CITY_AMM
REG_AMM_100	القويسمة	CITY_AMM
REG_AMM_101	الكرسي	CITY_AMM
REG_AMM_102	اللبن	CITY_AMM
REG_AMM_103	اللويبدة	CITY_AMM
REG_AMM_104	المحطة	CITY_AMM
REG_AMM_105	المرقب	CITY_AMM
REG_AMM_106	المستشفى الاسلامي	CITY_AMM
REG_AMM_107	المستندة	CITY_AMM
REG_AMM_108	المغيرات	CITY_AMM
REG_AMM_109	المهاجرين	CITY_AMM
REG_AMM_110	النخيل	CITY_AMM
REG_AMM_111	النزهة	CITY_AMM
REG_AMM_112	الوحدات	CITY_AMM
REG_AMM_113	اليادودة	CITY_AMM
REG_AMM_114	ام اذينة	CITY_AMM
REG_AMM_115	ام الاسود	CITY_AMM
REG_AMM_116	ام الحيران	CITY_AMM
REG_AMM_117	ام حجير	CITY_AMM
REG_AMM_118	ام زويتينة	CITY_AMM
REG_AMM_119	ام قصير-عمان	CITY_AMM
REG_AMM_120	ام نوارة	CITY_AMM
REG_AMM_121	تاج مول	CITY_AMM
REG_AMM_122	جامعة الاسراء	CITY_AMM
REG_AMM_123	جامعة البتراء	CITY_AMM
REG_AMM_124	جامعة الزيتونة	CITY_AMM
REG_AMM_125	جامعة الشرق الاوسط	CITY_AMM
REG_AMM_126	جامعة العلوم الاسلامية	CITY_AMM
REG_AMM_127	جامعة العلوم التطبيقية	CITY_AMM
REG_AMM_128	جاوا	CITY_AMM
REG_AMM_129	جبل الاخضر	CITY_AMM
REG_AMM_131	جبل الجوفة	CITY_AMM
REG_AMM_132	جبل الحديد	CITY_AMM
REG_AMM_133	جبل الزهور	CITY_AMM
REG_AMM_134	جبل القلعة	CITY_AMM
REG_AMM_135	جبل النصر	CITY_AMM
REG_AMM_144	حدائق الحسين	CITY_AMM
REG_AMM_146	حي الصحابة	CITY_AMM
REG_AMM_147	حي المنصور	CITY_AMM
REG_AMM_148	حي ام تينة	CITY_AMM
REG_AMM_149	حي عدن	CITY_AMM
REG_AMM_150	خريبة السوق	CITY_AMM
REG_AMM_151	دوار الحمايدة	CITY_AMM
REG_AMM_152	دوار الداخلية	CITY_AMM
REG_AMM_153	دوار الكيلو	CITY_AMM
REG_AMM_154	دوار المدينه الرياضيه	CITY_AMM
REG_AMM_155	دوار الواحة	CITY_AMM
REG_AMM_156	دير غبار	CITY_AMM
REG_AMM_157	ستي مول	CITY_AMM
REG_AMM_158	سكن كريم	CITY_AMM
REG_AMM_159	شارع الاذاعة	CITY_AMM
REG_AMM_160	شارع الاردن	CITY_AMM
REG_AMM_161	شارع الاستقلال	CITY_AMM
REG_AMM_162	شارع الامير محمد	CITY_AMM
REG_AMM_163	شارع الجامعة الاردنية	CITY_AMM
REG_AMM_164	شارع الحرية	CITY_AMM
REG_AMM_165	شارع الخالدي	CITY_AMM
REG_AMM_166	شارع المدينة الطبية	CITY_AMM
REG_AMM_167	شارع المدينة المنورة	CITY_AMM
REG_AMM_168	شارع عبدالله غوشة	CITY_AMM
REG_AMM_169	شارع مكة	CITY_AMM
REG_AMM_170	شارع ياجوز	CITY_AMM
REG_AMM_171	صالحية العابد	CITY_AMM
REG_AMM_172	صويلح	CITY_AMM
REG_AMM_173	ضاحية الاستقلال	CITY_AMM
REG_AMM_174	ضاحية الامير راشد	CITY_AMM
REG_AMM_175	ضاحية الامير علي	CITY_AMM
REG_AMM_176	ضاحية الاميرة ايمان	CITY_AMM
REG_AMM_177	ضاحية الاميرة سلمى	CITY_AMM
REG_AMM_178	ضاحية الحاج حسن	CITY_AMM
REG_AMM_179	ضاحية الحسين-عمان	CITY_AMM
REG_AMM_180	ضاحية الروضة	CITY_AMM
REG_AMM_181	ضاحية الفاروق	CITY_AMM
REG_AMM_182	طاب قراع	CITY_AMM
REG_AMM_183	طارق	CITY_AMM
REG_AMM_184	طريق المطار	CITY_AMM
REG_AMM_185	طلوع المصدار	CITY_AMM
REG_AMM_186	طلوع عين غزال	CITY_AMM
REG_AMM_187	طلوع نيفين	CITY_AMM
REG_AMM_188	عراق الامير	CITY_AMM
REG_AMM_189	عرجان	CITY_AMM
REG_AMM_190	عريفة مول	CITY_AMM
REG_AMM_192	عين الباشا	CITY_AMM
REG_AMM_193	عين غزال	CITY_AMM
REG_AMM_194	كلية حطين	CITY_AMM
REG_AMM_195	ماركا الجنوبية	CITY_AMM
REG_AMM_196	ماركا الشمالية	CITY_AMM
REG_AMM_197	مجدي مول	CITY_AMM
REG_AMM_198	مجمع الاعمال	CITY_AMM
REG_AMM_199	مجمع الجنوب	CITY_AMM
REG_AMM_200	مجمع الشمال	CITY_AMM
REG_AMM_201	مجمع رغدان	CITY_AMM
REG_AMM_202	مخيم الحسين	CITY_AMM
REG_AMM_203	مخيم النصر	CITY_AMM
REG_AMM_204	مرج الفرس	CITY_AMM
REG_AMM_205	مستشفى الاردن	CITY_AMM
REG_AMM_206	مستشفى الاستشاري	CITY_AMM
REG_AMM_207	مستشفى الاسراء	CITY_AMM
REG_AMM_208	مستشفى الامل	CITY_AMM
REG_AMM_209	مستشفى الامير حمزه	CITY_AMM
REG_AMM_210	مستشفى البشير	CITY_AMM
REG_AMM_211	مستشفى التخصصي	CITY_AMM
REG_AMM_212	مستشفى الجامعه	CITY_AMM
REG_AMM_213	مستشفى الحسين للسرطان	CITY_AMM
REG_AMM_214	مستشفى الخالدي	CITY_AMM
REG_AMM_215	مستشفى الرشيد	CITY_AMM
REG_AMM_216	مستشفى الملكه علياء	CITY_AMM
REG_AMM_217	مستشفى عبد الهادي للعيون	CITY_AMM
REG_AMM_218	مطار الملكة علياء	CITY_AMM
REG_AMM_219	مكة مول	CITY_AMM
REG_AMM_221	نادي السباق	CITY_AMM
REG_AMM_222	وادي الحدادة	CITY_AMM
REG_AMM_223	وادي الرمم	CITY_AMM
REG_AMM_224	وادي صقرا	CITY_AMM
REG_AMM_225	وادي عبدون	CITY_AMM
REG_AMM_226	وزارة الصحه	CITY_AMM
REG_IRB_001	الحي الشرقي	CITY_IRB
REG_IRB_002	شارع الجامعة	CITY_IRB
REG_IRB_003	الحصن	CITY_IRB
REG_IRB_004	الرمثا	CITY_IRB
REG_IRB_005	الحي الجنوبي	CITY_IRB
REG_IRB_006	البارحة	CITY_IRB
REG_IRB_007	كفريوبا	CITY_IRB
REG_IRB_008	بيت راس	CITY_IRB
REG_IRB_009	بشرى	CITY_IRB
REG_IRB_010	الصريح	CITY_IRB
REG_IRB_011	المشارع	CITY_IRB
REG_IRB_012	لواء الكورة	CITY_IRB
REG_IRB_013	لواء بني كنانة	CITY_IRB
REG_IRB_014	حكما	CITY_IRB
REG_IRB_015	ايدون	CITY_IRB
REG_IRB_016	مخيم اربد	CITY_IRB
REG_IRB_017	الحي الشمالي	CITY_IRB
REG_IRB_018	حواره	CITY_IRB
REG_IRB_019	كفر جايز	CITY_IRB
REG_IRB_020	كفر أسد	CITY_IRB
REG_IRB_021	لواء المزار الشمالي	CITY_IRB
REG_IRB_022	لواء الطيبة	CITY_IRB
REG_IRB_023	لواء الاغوار الشمالية	CITY_IRB
REG_IRB_024	دير ابي سعيد	CITY_IRB
REG_IRB_025	الشونة الشمالية	CITY_IRB
REG_IRB_026	اربد-شارع البتراء	CITY_IRB
REG_IRB_027	اشارة النسيم	CITY_IRB
REG_IRB_028	بني كنانة	CITY_IRB
REG_IRB_029	حبكا	CITY_IRB
REG_IRB_030	زبدة	CITY_IRB
REG_IRB_031	سحم	CITY_IRB
REG_IRB_032	سمر	CITY_IRB
REG_IRB_033	صمد	CITY_IRB
REG_IRB_034	علعال	CITY_IRB
REG_IRB_035	فوعرا	CITY_IRB
REG_IRB_036	كفر راكب	CITY_IRB
REG_IRB_037	كفرابيل	CITY_IRB
REG_IRB_038	كفرسوم	CITY_IRB
REG_IRB_039	لواء بني عبيد	CITY_IRB
REG_IRB_040	ابان	CITY_IRB
REG_IRB_041	ابدر	CITY_IRB
REG_IRB_042	ابو اللوقس	CITY_IRB
REG_IRB_043	ابو هابيل	CITY_IRB
REG_IRB_044	اربد	CITY_IRB
REG_IRB_045	اربد مول	CITY_IRB
REG_IRB_047	البياضة	CITY_IRB
REG_IRB_048	الحمة	CITY_IRB
REG_IRB_049	الحي الشرقي-اربد	CITY_IRB
REG_IRB_050	الحي الشمالي-اربد	CITY_IRB
REG_IRB_051	الخراج	CITY_IRB
REG_IRB_052	الخيرية	CITY_IRB
REG_IRB_053	الراهبات	CITY_IRB
REG_IRB_054	الرفيد	CITY_IRB
REG_IRB_055	الطيبة - اربد	CITY_IRB
REG_IRB_056	القصيلة	CITY_IRB
REG_IRB_057	المخيبة	CITY_IRB
REG_IRB_058	المزار الشمالي	CITY_IRB
REG_IRB_059	المزيريب	CITY_IRB
REG_IRB_060	المنشية-اربد	CITY_IRB
REG_IRB_061	المنصورة-اربد	CITY_IRB
REG_IRB_062	النعيمة	CITY_IRB
REG_IRB_063	اليرموك	CITY_IRB
REG_IRB_064	ام قيس	CITY_IRB
REG_IRB_065	بني عبيد	CITY_IRB
REG_IRB_066	بيت ايدس	CITY_IRB
REG_IRB_067	بيت يافا	CITY_IRB
REG_IRB_068	تقبل	CITY_IRB
REG_IRB_069	ججين	CITY_IRB
REG_IRB_070	جحفية	CITY_IRB
REG_IRB_071	جديتا	CITY_IRB
REG_IRB_072	جمحة	CITY_IRB
REG_IRB_073	حاتم	CITY_IRB
REG_IRB_074	حب راس	CITY_IRB
REG_IRB_075	حرثا	CITY_IRB
REG_IRB_076	حريما	CITY_IRB
REG_IRB_077	حنينا	CITY_IRB
REG_IRB_078	حوفا المزار	CITY_IRB
REG_IRB_079	حوفا الوسطية	CITY_IRB
REG_IRB_080	حي التركمان	CITY_IRB
REG_IRB_081	حي الراهبات	CITY_IRB
REG_IRB_082	حي الطوال	CITY_IRB
REG_IRB_083	حي القصيلة	CITY_IRB
REG_IRB_084	خرجا	CITY_IRB
REG_IRB_085	دوار العيادات	CITY_IRB
REG_IRB_086	دوار القبة	CITY_IRB
REG_IRB_087	دوار النسيم	CITY_IRB
REG_IRB_088	دوار اليوسفي	CITY_IRB
REG_IRB_089	دوار رحال	CITY_IRB
REG_IRB_090	دوار وصفي التل	CITY_IRB
REG_IRB_091	دوقرة	CITY_IRB
REG_IRB_092	دير السعنة	CITY_IRB
REG_IRB_093	زحر	CITY_IRB
REG_IRB_094	زوبيا	CITY_IRB
REG_IRB_095	سحم الكفارات	CITY_IRB
REG_IRB_096	سما الروسان	CITY_IRB
REG_IRB_097	سموع	CITY_IRB
REG_IRB_098	سوم	CITY_IRB
REG_IRB_099	شارع 60	CITY_IRB
REG_IRB_100	شارع الحصن	CITY_IRB
REG_IRB_101	شارع الهاشمي	CITY_IRB
REG_IRB_102	شارع فلسطين	CITY_IRB
REG_IRB_103	شطنا	CITY_IRB
REG_IRB_104	صما	CITY_IRB
REG_IRB_105	صيدور	CITY_IRB
REG_IRB_106	ضاحية الحسين-اربد	CITY_IRB
REG_IRB_107	عزريت	CITY_IRB
REG_IRB_108	عقربا	CITY_IRB
REG_IRB_109	عنبة	CITY_IRB
REG_IRB_110	قليعات	CITY_IRB
REG_IRB_111	قم وقميم	CITY_IRB
REG_IRB_112	كتم	CITY_IRB
REG_IRB_113	كريمة	CITY_IRB
REG_IRB_114	كفر ابيل	CITY_IRB
REG_IRB_115	كفر اسد	CITY_IRB
REG_IRB_116	كفر الما	CITY_IRB
REG_IRB_117	كفر عان	CITY_IRB
REG_IRB_118	كفر عوان	CITY_IRB
REG_IRB_119	كفر كيفيا	CITY_IRB
REG_IRB_120	مجمع الاغوار	CITY_IRB
REG_IRB_121	مجمع عمان	CITY_IRB
REG_IRB_122	مخربا	CITY_IRB
REG_IRB_123	مخيم الحصن	CITY_IRB
REG_IRB_124	مستشفى بديعة	CITY_IRB
REG_IRB_125	ملكا	CITY_IRB
REG_IRB_126	مندح	CITY_IRB
REG_IRB_127	ناطفة	CITY_IRB
REG_IRB_128	هام	CITY_IRB
REG_IRB_129	وادي الريان	CITY_IRB
REG_IRB_130	وسط البلد-اربد	CITY_IRB
REG_IRB_131	وقاص	CITY_IRB
REG_ZAR_001	الزرقاء الجديدة	CITY_ZAR
REG_ZAR_002	الرصيفة	CITY_ZAR
REG_ZAR_003	عوجان	CITY_ZAR
REG_ZAR_004	حي معصوم	CITY_ZAR
REG_ZAR_005	الغويرية	CITY_ZAR
REG_ZAR_006	حي الحسين	CITY_ZAR
REG_ZAR_007	وادي الحجر	CITY_ZAR
REG_ZAR_008	الضليل	CITY_ZAR
REG_ZAR_009	بيرين	CITY_ZAR
REG_ZAR_010	حي الجندي	CITY_ZAR
REG_ZAR_011	حي الامير محمد	CITY_ZAR
REG_ZAR_012	حي رمزي	CITY_ZAR
REG_ZAR_013	الجبل الابيض	CITY_ZAR
REG_ZAR_014	حي القمر	CITY_ZAR
REG_ZAR_015	مدينة الشرق	CITY_ZAR
REG_ZAR_016	البتراوي	CITY_ZAR
REG_ZAR_017	حي الفلاح	CITY_ZAR
REG_ZAR_018	حي الزواهرة	CITY_ZAR
REG_ZAR_019	حي المصانع	CITY_ZAR
REG_ZAR_020	حي الدويك	CITY_ZAR
REG_ZAR_021	حي الجنينة	CITY_ZAR
REG_ZAR_022	حي الاسكان	CITY_ZAR
REG_ZAR_023	حي البستان	CITY_ZAR
REG_ZAR_024	ياجوز	CITY_ZAR
REG_ZAR_025	الهاشمية	CITY_ZAR
REG_ZAR_026	السخنة	CITY_ZAR
REG_ZAR_027	حي الرشيد	CITY_ZAR
REG_ZAR_028	حي الجبر	CITY_ZAR
REG_ZAR_029	حي اسكان الامير طلال	CITY_ZAR
REG_ZAR_030	حي الامير هاشم	CITY_ZAR
REG_ZAR_031	حي القادسية	CITY_ZAR
REG_ZAR_032	حي حطين	CITY_ZAR
REG_ZAR_033	اسكان الامير طلال	CITY_ZAR
REG_ZAR_034	الاتوستراد	CITY_ZAR
REG_ZAR_035	البركة	CITY_ZAR
REG_ZAR_036	الجبل الشمالي	CITY_ZAR
REG_ZAR_037	الحاوز	CITY_ZAR
REG_ZAR_038	الحرة	CITY_ZAR
REG_ZAR_039	الزرقاء	CITY_ZAR
REG_ZAR_040	الزواهرة	CITY_ZAR
REG_ZAR_041	السوق-الزرقاء	CITY_ZAR
REG_ZAR_042	الضليل-الزرقاء	CITY_ZAR
REG_ZAR_043	العالوك	CITY_ZAR
REG_ZAR_044	الغباوي-الزرقاء	CITY_ZAR
REG_ZAR_045	القادسية-الزرقاء	CITY_ZAR
REG_ZAR_046	المجمع الجديد	CITY_ZAR
REG_ZAR_047	المجمع القديم	CITY_ZAR
REG_ZAR_048	المشيرفة	CITY_ZAR
REG_ZAR_049	ام رمانة	CITY_ZAR
REG_ZAR_050	إسكان النقب	CITY_ZAR
REG_ZAR_051	جبل الامير حسن	CITY_ZAR
REG_ZAR_052	جبل الامير فيصل	CITY_ZAR
REG_ZAR_053	جبل الاميرة رحمة	CITY_ZAR
REG_ZAR_054	جبل طارق	CITY_ZAR
REG_ZAR_055	جريبا	CITY_ZAR
REG_ZAR_056	جسر العرادفة	CITY_ZAR
REG_ZAR_057	جناعة	CITY_ZAR
REG_ZAR_058	حي الاحمد	CITY_ZAR
REG_ZAR_059	حي الامير حسن	CITY_ZAR
REG_ZAR_060	حي الظاهرية	CITY_ZAR
REG_ZAR_061	حي النزهة	CITY_ZAR
REG_ZAR_062	حي زمزم	CITY_ZAR
REG_ZAR_063	حي شاكر	CITY_ZAR
REG_ZAR_064	حي نصار	CITY_ZAR
REG_ZAR_065	دوار ابو طافش	CITY_ZAR
REG_ZAR_066	رجم الشوك	CITY_ZAR
REG_ZAR_067	سروت	CITY_ZAR
REG_ZAR_068	شارع 36	CITY_ZAR
REG_ZAR_069	شارع السعادة	CITY_ZAR
REG_ZAR_070	شارع المصفاه	CITY_ZAR
REG_ZAR_071	شارع الوينك	CITY_ZAR
REG_ZAR_072	شومر	CITY_ZAR
REG_ZAR_073	ضاحية الاميرة هيا	CITY_ZAR
REG_ZAR_074	ضاحية المدينة المنورة	CITY_ZAR
REG_ZAR_075	ضاحية مكة	CITY_ZAR
REG_ZAR_076	قرية ابو صياح	CITY_ZAR
REG_ZAR_077	مثلث الشرطة	CITY_ZAR
REG_ZAR_078	مخيم حطين	CITY_ZAR
REG_ZAR_079	مخيم شنلر	CITY_ZAR
REG_ZAR_080	مستشفى الحكمه	CITY_ZAR
REG_ZAR_081	مستشفى جبل الزيتونه	CITY_ZAR
REG_ZAR_082	نادي الضباط	CITY_ZAR
REG_ZAR_083	وادي العش	CITY_ZAR
REG_AQA_001	البلد القديمة	CITY_AQA
REG_AQA_002	المنطقة السكنية الثالثة	CITY_AQA
REG_AQA_003	الخامسة	CITY_AQA
REG_AQA_004	الشلالة	CITY_AQA
REG_AQA_005	حي الكرامة	CITY_AQA
REG_AQA_006	وادي رم	CITY_AQA
REG_AQA_007	المنطقة التاسعة	CITY_AQA
REG_AQA_008	المنطقة العاشرة	CITY_AQA
REG_AQA_009	القويرة	CITY_AQA
REG_AQA_010	الديسي	CITY_AQA
REG_AQA_011	اعسيلة	CITY_AQA
REG_AQA_012	التاسعة	CITY_AQA
REG_AQA_013	الثالثة	CITY_AQA
REG_AQA_014	الثامنة	CITY_AQA
REG_AQA_015	الجنوبي	CITY_AQA
REG_AQA_016	الحادي عشر	CITY_AQA
REG_AQA_017	الحادية عشر	CITY_AQA
REG_AQA_018	الحميمة	CITY_AQA
REG_AQA_019	الخزان	CITY_AQA
REG_AQA_020	الرابغة	CITY_AQA
REG_AQA_021	الرابية	CITY_AQA
REG_AQA_022	الرمال	CITY_AQA
REG_AQA_023	السابعة	CITY_AQA
REG_AQA_024	السوق-العقبة	CITY_AQA
REG_AQA_025	الشامية	CITY_AQA
REG_AQA_026	الشلال	CITY_AQA
REG_AQA_027	الطويسة	CITY_AQA
REG_AQA_028	العاشرة	CITY_AQA
REG_AQA_029	العالمية	CITY_AQA
REG_AQA_030	العقبة	CITY_AQA
REG_AQA_031	القاسمية	CITY_AQA
REG_AQA_032	الكرامة-العقبة	CITY_AQA
REG_AQA_033	المحدود الشرقي	CITY_AQA
REG_AQA_034	المحدود الغربي	CITY_AQA
REG_AQA_035	المحدود الوسط	CITY_AQA
REG_AQA_036	المدينة-العقبة	CITY_AQA
REG_AQA_037	الوحدات الغربي-العقبة	CITY_AQA
REG_AQA_038	حميمة-العقبة	CITY_AQA
REG_AQA_039	شارع صلاح الدين-العقبة	CITY_AQA
REG_AQA_040	قطر-العقبة	CITY_AQA
REG_AQA_041	مريغة-العقبة	CITY_AQA
REG_AQA_042	وادي اليتم-العقبة	CITY_AQA
REG_SLT_001	وسط البلد	CITY_SLT
REG_SLT_002	البحيرة	CITY_SLT
REG_SLT_003	زي	CITY_SLT
REG_SLT_004	علان	CITY_SLT
REG_SLT_005	يارقا	CITY_SLT
REG_SLT_006	عبلن	CITY_SLT
REG_SLT_007	الفحيص	CITY_SLT
REG_SLT_008	ماحص	CITY_SLT
REG_SLT_009	الجوفة	CITY_SLT
REG_SLT_010	الحمر	CITY_SLT
REG_SLT_011	الرامة	CITY_SLT
REG_SLT_012	الروضة-السلط	CITY_SLT
REG_SLT_013	الزعتري-السلط	CITY_SLT
REG_SLT_014	السرو	CITY_SLT
REG_SLT_015	السلالم	CITY_SLT
REG_SLT_016	السلط	CITY_SLT
REG_SLT_017	الشويح	CITY_SLT
REG_SLT_018	الصبيحي	CITY_SLT
REG_SLT_019	العيزرية	CITY_SLT
REG_SLT_020	الكرامة-السلط	CITY_SLT
REG_SLT_021	الكمالية	CITY_SLT
REG_SLT_022	المدينة-السلط	CITY_SLT
REG_SLT_023	المضمار	CITY_SLT
REG_SLT_024	ام الدنانير	CITY_SLT
REG_SLT_025	سويمة	CITY_SLT
REG_SLT_026	شارع الستين	CITY_SLT
REG_SLT_027	عيرا ويرقا	CITY_SLT
REG_SLT_028	مستشفى السلط الحكومي	CITY_SLT
REG_SLT_029	موبص	CITY_SLT
REG_SLT_030	نقب الدبور	CITY_SLT
REG_SLT_031	وادي شعيب	CITY_SLT
REG_MDB_001	وسط المدينة	CITY_MDB
REG_MDB_002	جرينة	CITY_MDB
REG_MDB_003	الفيصلية	CITY_MDB
REG_MDB_004	ذيبان	CITY_MDB
REG_MDB_005	العريش	CITY_MDB
REG_MDB_006	المشقر	CITY_MDB
REG_MDB_007	لب	CITY_MDB
REG_MDB_008	مليح	CITY_MDB
REG_MDB_009	اريمبا الشرقية	CITY_MDB
REG_MDB_010	arimba al gharbieh	CITY_MDB
REG_MDB_011	الاندلسية	CITY_MDB
REG_MDB_012	الجامعة الالمانية	CITY_MDB
REG_MDB_013	الجامعة الامريكية	CITY_MDB
REG_MDB_014	الجيزة	CITY_MDB
REG_MDB_015	الخالدية-مادبا	CITY_MDB
REG_MDB_016	الخطابية	CITY_MDB
REG_MDB_017	الروضة-مادبا	CITY_MDB
REG_MDB_018	الزميلة	CITY_MDB
REG_MDB_019	العال	CITY_MDB
REG_MDB_020	العالية	CITY_MDB
REG_MDB_021	الفيصلية-مادبا	CITY_MDB
REG_MDB_022	القسطل	CITY_MDB
REG_MDB_023	المامونية	CITY_MDB
REG_MDB_024	النديم	CITY_MDB
REG_MDB_025	ام البساتين	CITY_MDB
REG_MDB_026	ام الرصاص	CITY_MDB
REG_MDB_027	ام العمد	CITY_MDB
REG_MDB_028	ام قصير-مادبا	CITY_MDB
REG_MDB_029	جبل بني حميدة	CITY_MDB
REG_MDB_030	جرين لاند	CITY_MDB
REG_MDB_031	جرينا	CITY_MDB
REG_MDB_032	حسبان	CITY_MDB
REG_MDB_033	دوار العشائر	CITY_MDB
REG_MDB_034	دوار المحافظة	CITY_MDB
REG_MDB_035	دوار المحبة	CITY_MDB
REG_MDB_036	زيزيا	CITY_MDB
REG_MDB_037	ضبعة	CITY_MDB
REG_MDB_038	مادبا	CITY_MDB
REG_MDB_039	ماعين	CITY_MDB
REG_MDB_040	مريجمة	CITY_MDB
REG_MDB_041	منجا	CITY_MDB
REG_KAR_001	المزار الجنوبي	CITY_KAR
REG_KAR_002	المرج	CITY_KAR
REG_KAR_003	مؤتة	CITY_KAR
REG_KAR_004	الثنية	CITY_KAR
REG_KAR_005	القصر	CITY_KAR
REG_KAR_006	الربة	CITY_KAR
REG_KAR_007	القطرانة	CITY_KAR
REG_KAR_008	العدنانية	CITY_KAR
REG_KAR_009	الجديدة	CITY_KAR
REG_KAR_010	ادر-الكرك	CITY_KAR
REG_KAR_011	اريحا-الكرك	CITY_KAR
REG_KAR_012	الثلاجة-الكرك	CITY_KAR
REG_KAR_013	الجدعة-الكرك	CITY_KAR
REG_KAR_014	الجديدية-الكرك	CITY_KAR
REG_KAR_015	الھاوية-الكرك	CITY_KAR
REG_KAR_016	الخالدية-الكرك	CITY_KAR
REG_KAR_017	الربة-الكرك	CITY_KAR
REG_KAR_018	السماكية-الكرك	CITY_KAR
REG_KAR_019	الشهابية-الكرك	CITY_KAR
REG_KAR_020	العراق-الكرك	CITY_KAR
REG_KAR_021	القصر-الكرك	CITY_KAR
REG_KAR_022	الكرك	CITY_KAR
REG_KAR_023	المرج-الكرك	CITY_KAR
REG_KAR_024	المزار الجنوبي-الكرك	CITY_KAR
REG_KAR_025	المنشية-الكرك	CITY_KAR
REG_KAR_026	الوسية-الكرك	CITY_KAR
REG_KAR_027	الياروت	CITY_KAR
REG_KAR_028	امرع	CITY_KAR
REG_KAR_029	جوزة	CITY_KAR
REG_KAR_030	دمنة	CITY_KAR
REG_KAR_031	ذات راس	CITY_KAR
REG_KAR_032	راكين	CITY_KAR
REG_KAR_033	زحوم	CITY_KAR
REG_KAR_034	سكة	CITY_KAR
REG_KAR_035	سمرا	CITY_KAR
REG_KAR_036	سول	CITY_KAR
REG_KAR_037	شحتور	CITY_KAR
REG_KAR_038	شيحان	CITY_KAR
REG_KAR_039	صرفة	CITY_KAR
REG_KAR_040	عزرا	CITY_KAR
REG_KAR_041	عي	CITY_KAR
REG_KAR_042	فقوع	CITY_KAR
REG_KAR_043	قرى الحمود	CITY_KAR
REG_KAR_044	قرى الخريشا	CITY_KAR
REG_KAR_045	مثلث جريفلة	CITY_KAR
REG_KAR_046	محي	CITY_KAR
REG_KAR_047	مشيرفة	CITY_KAR
REG_KAR_048	مغير	CITY_KAR
REG_JER_001	مخيم جرش	CITY_JER
REG_JER_002	سوف	CITY_JER
REG_JER_003	الكتة	CITY_JER
REG_JER_004	برما	CITY_JER
REG_JER_005	المصطبة	CITY_JER
REG_JER_006	النسيم	CITY_JER
REG_JER_007	القبسة	CITY_JER
REG_JER_008	الحدادة	CITY_JER
REG_JER_009	ادر-جرش	CITY_JER
REG_JER_010	اريحا-جرش	CITY_JER
REG_JER_011	الثلاجة-جرش	CITY_JER
REG_JER_012	الجدعة-جرش	CITY_JER
REG_JER_013	الجديدية-جرش	CITY_JER
REG_JER_014	الحاوية-جرش	CITY_JER
REG_JER_015	الخالدية-جرش	CITY_JER
REG_JER_016	الربة-جرش	CITY_JER
REG_JER_017	الروضة-جرش	CITY_JER
REG_JER_018	السماكية-جرش	CITY_JER
REG_JER_019	الشهابية-جرش	CITY_JER
REG_JER_020	الصالحية	CITY_JER
REG_JER_021	الطيبة - جرش	CITY_JER
REG_JER_022	المدينة-جرش	CITY_JER
REG_JER_023	الوحدات الغربي-جرش	CITY_JER
REG_JER_024	جرش	CITY_JER
REG_JER_025	حميمة-جرش	CITY_JER
REG_JER_026	ساكب	CITY_JER
REG_JER_027	شارع صلاح الدين-جرش	CITY_JER
REG_JER_028	ظهر السرو	CITY_JER
REG_JER_029	قطر-جرش	CITY_JER
REG_JER_030	كفر خل	CITY_JER
REG_JER_031	مريغة-جرش	CITY_JER
REG_JER_032	وادي اليتم-جرش	CITY_JER
REG_AJL_001	عنجرة	CITY_AJL
REG_AJL_002	كفرنجة	CITY_AJL
REG_AJL_003	عين جنا	CITY_AJL
REG_AJL_004	صخرة	CITY_AJL
REG_AJL_005	الهاشمية	CITY_AJL
REG_AJL_006	حلاوة	CITY_AJL
REG_AJL_007	الروابي	CITY_AJL
REG_AJL_008	الفاخرة	CITY_AJL
REG_AJL_009	بلاص	CITY_AJL
REG_AJL_010	راس منيف	CITY_AJL
REG_AJL_011	صنعار	CITY_AJL
REG_AJL_012	عبلين	CITY_AJL
REG_AJL_013	عبين	CITY_AJL
REG_AJL_014	عين البستان	CITY_AJL
REG_AJL_015	العراق-عجلون	CITY_AJL
REG_AJL_016	العمرية	CITY_AJL
REG_AJL_017	الفيصلية-عجلون	CITY_AJL
REG_AJL_018	القصر-عجلون	CITY_AJL
REG_AJL_019	المدينة-عجلون	CITY_AJL
REG_AJL_020	المرج-عجلون	CITY_AJL
REG_AJL_021	المزار الجنوبي-عجلون	CITY_AJL
REG_AJL_022	المعمورة-عجلون	CITY_AJL
REG_AJL_023	المنشية-عجلون	CITY_AJL
REG_AJL_024	الوسية-عجلون	CITY_AJL
REG_AJL_025	عجلون	CITY_AJL
REG_AJL_026	ين البستان	CITY_AJL
REG_MAA_002	الشوبك	CITY_MAA
REG_MAA_003	وادي موسى	CITY_MAA
REG_MAA_004	الحسينية	CITY_MAA
REG_MAA_005	ايل	CITY_MAA
REG_MAA_006	الجرباء	CITY_MAA
REG_MAA_007	الاشعري	CITY_MAA
REG_MAA_008	ابو اللسن	CITY_MAA
REG_MAA_009	اذرح	CITY_MAA
REG_MAA_010	الجربة	CITY_MAA
REG_MAA_011	السطح	CITY_MAA
REG_MAA_012	الطيبة - معان	CITY_MAA
REG_MAA_013	الفرذخ	CITY_MAA
REG_MAA_014	المدينة-معان	CITY_MAA
REG_MAA_015	المنشية-معان	CITY_MAA
REG_MAA_016	بير ابو دنة	CITY_MAA
REG_MAA_017	دلاغة	CITY_MAA
REG_MAA_018	روضة الامير راشد	CITY_MAA
REG_MAA_019	معان	CITY_MAA
REG_TAF_001	بصيرا	CITY_TAF
REG_TAF_002	عين البيضاء	CITY_TAF
REG_TAF_003	الحسا	CITY_TAF
REG_TAF_004	القادسية	CITY_TAF
REG_TAF_005	العيص	CITY_TAF
REG_TAF_006	ابو بنا	CITY_TAF
REG_TAF_007	ارويم	CITY_TAF
REG_TAF_008	الطفيلة	CITY_TAF
REG_TAF_009	القادسية-الطفيلة	CITY_TAF
REG_TAF_010	شيظم	CITY_TAF
REG_TAF_011	عين البيضا	CITY_TAF
REG_TAF_012	عينة	CITY_TAF
REG_TAF_013	غرندل	CITY_TAF
REG_TAF_014	وادي زيد	CITY_TAF
REG_MAF_001	المفرق البلد	CITY_MAF
REG_MAF_002	الزعتري	CITY_MAF
REG_MAF_003	صبحا وصبحية	CITY_MAF
REG_MAF_004	الرويشد	CITY_MAF
REG_MAF_005	المنشية	CITY_MAF
REG_MAF_006	الخالدية	CITY_MAF
REG_MAF_007	الزنية	CITY_MAF
REG_MAF_008	ايدون	CITY_MAF
REG_MAF_009	ام القطين	CITY_MAF
REG_MAF_010	بلعما	CITY_MAF
REG_MAF_011	رحاب	CITY_MAF
REG_MAF_012	ارحاب	CITY_MAF
REG_MAF_013	البادية الشمالية	CITY_MAF
REG_MAF_014	الباعج	CITY_MAF
REG_MAF_015	البشرية	CITY_MAF
REG_MAF_016	الجبل الاخضر	CITY_MAF
REG_MAF_017	الحلابات	CITY_MAF
REG_MAF_018	الحمرا	CITY_MAF
REG_MAF_019	الخالدية - المفرق	CITY_MAF
REG_MAF_020	الخناصري	CITY_MAF
REG_MAF_021	الدجنية	CITY_MAF
REG_MAF_022	الدفيانة	CITY_MAF
REG_MAF_023	الزبيدية	CITY_MAF
REG_MAF_024	الزعتري-المفرق	CITY_MAF
REG_MAF_025	الزيتونة	CITY_MAF
REG_MAF_026	السعيدية	CITY_MAF
REG_MAF_027	الصها	CITY_MAF
REG_MAF_028	الضليل-المفرق	CITY_MAF
REG_MAF_029	الغدير الابيض	CITY_MAF
REG_MAF_030	الغدير الاخضر	CITY_MAF
REG_MAF_031	الكرم	CITY_MAF
REG_MAF_032	الكوم الاحمر	CITY_MAF
REG_MAF_033	المخيم	CITY_MAF
REG_MAF_034	المدينة-المفرق	CITY_MAF
REG_MAF_035	المزرعة	CITY_MAF
REG_MAF_036	المعمرية	CITY_MAF
REG_MAF_037	المفرق	CITY_MAF
REG_MAF_038	المنشية-المفرق	CITY_MAF
REG_MAF_039	المنصورة-المفرق	CITY_MAF
REG_MAF_040	ام الجمال	CITY_MAF
REG_MAF_041	بويضة الحوامدة	CITY_MAF
REG_MAF_042	بويضة العليمات	CITY_MAF
REG_MAF_043	ثغرة الجب	CITY_MAF
REG_MAF_044	جابر السرحان	CITY_MAF
REG_MAF_045	جامعة ال البيت	CITY_MAF
REG_MAF_046	حمامة العليمات	CITY_MAF
REG_MAF_047	حمامة العموش	CITY_MAF
REG_MAF_048	حوشة	CITY_MAF
REG_MAF_049	حيان الرويبض	CITY_MAF
REG_MAF_050	دير الكهف	CITY_MAF
REG_MAF_051	رباع السرحان	CITY_MAF
REG_MAF_052	رجم سبيع	CITY_MAF
REG_MAF_053	سما السرحان	CITY_MAF
REG_MAF_054	صبحة وصبحية	CITY_MAF
REG_MAF_055	ضاحية الامير محمد	CITY_MAF
REG_MAF_056	ضاحية الملك عبدالله	CITY_MAF
REG_MAF_057	طيب اسم	CITY_MAF
REG_MAF_058	عمرة وعميرة	CITY_MAF
REG_MAF_059	عين بني حسن	CITY_MAF
REG_MAF_060	فاع	CITY_MAF
REG_MAF_061	مخيم الزعتري	CITY_MAF
REG_MAF_062	مستشفى الملك طلال	CITY_MAF
REG_MAF_063	مستشفى سارة التخصصي	CITY_MAF
REG_MAF_064	مغير السرحان	CITY_MAF
REG_MAF_065	منشية كعيبر	CITY_MAF
REG_MAF_066	نايفة	CITY_MAF
REG_WAD_001	قريقرة	CITY_WAD
REG_AZR_001	الازرق	CITY_AZR
REG_AGH_001	الاغوار الجنوبية	CITY_AGH
REG_AGH_002	الاغوار الشمالية	CITY_AGH
REG_AGH_003	البحر الميت	CITY_AGH
REG_AGH_004	الشونة الجنوبية	CITY_AGH
REG_AGH_005	الشونة الشمالية	CITY_AGH
REG_AGH_006	الشونة الوسطى	CITY_AGH
REG_AGH_007	الكريمة	CITY_AGH
REG_AGH_008	المعمورة-الاغوار	CITY_AGH
REG_AGH_009	دير علا	CITY_AGH
REG_AGH_010	غور الحديثة	CITY_AGH
REG_AGH_011	غور الصافي	CITY_AGH
REG_AGH_012	غور المزرعة	CITY_AGH
REG_AGH_013	غور فيفا	CITY_AGH
REG_DES_001	الابيض	CITY_DES
REG_DES_002	الحسا	CITY_DES
REG_DES_003	الحسينية	CITY_DES
REG_DES_004	الدامخي	CITY_DES
REG_DES_005	الراشدية	CITY_DES
REG_DES_006	السواقة	CITY_DES
REG_DES_007	القطرانة	CITY_DES
REG_DES_008	القويرة	CITY_DES
REG_DES_009	المحمدية	CITY_DES
REG_DES_010	المريغة	CITY_DES
REG_DES_011	جرف الدراويش	CITY_DES
REG_DES_012	دبة حانوت	CITY_DES
REG_DES_013	راجف	CITY_DES
REG_DES_014	راس النقب	CITY_DES
REG_DES_015	سد السلطاني	CITY_DES
REG_DES_016	طريق الصحراوي	CITY_DES
REG_BLQ_001	الشونة الجنوبية	CITY_BLQ
REG_BLQ_002	ماحص	CITY_BLQ
REG_BLQ_003	الفحيص	CITY_BLQ
REG_BLQ_004	البقعة	CITY_BLQ
REG_BLQ_005	عين الباشا	CITY_BLQ
REG_BLQ_006	دير علا	CITY_BLQ
REG_BLQ_007	الصبيحي	CITY_BLQ
REG_BLQ_008	علان	CITY_BLQ
REG_BLQ_009	البلقاء	CITY_BLQ
REG_BLQ_010	سلحوب	CITY_BLQ
REG_PET_001	وادي موسى	CITY_PET
REG_PET_002	البتراء	CITY_PET
REG_PET_003	الطيبة - البتراء	CITY_PET
REG_RAM_001	الرمثا البلد	CITY_RAM
REG_RAM_002	الاكيدر	CITY_RAM
REG_RAM_003	الحي الشمالي-الرمثا	CITY_RAM
REG_RAM_004	الرمثا	CITY_RAM
REG_RAM_005	الشجرة	CITY_RAM
REG_RAM_006	دوار 500	CITY_RAM
REG_RAM_007	عمراوة	CITY_RAM
REG_RAM_008	مدينة الحسن الصناعية	CITY_RAM
REG_RAM_009	مستشفى الرمثا الحكومي	CITY_RAM
REG_SHO_001	الشوبك البلد	CITY_SHO
REG_SHO_002	الشوبك	CITY_SHO
REG_SHO_003	فيصلية الشوبك	CITY_SHO
REG_MOW_001	الموقر	CITY_MOW
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, user_count, permissions) FROM stdin;
supervisor	مشرف	يمكنه إدارة الطلبات والسائقين والتقارير.	3	{dashboard:view,orders:view,orders:create,orders:edit}
admin	المدير العام	وصول كامل لجميع أجزاء النظام والإعدادات.	1	{all}
customer_service	خدمة العملاء	يمكنه إضافة الطلبات ومتابعتها.	1	{orders:view,orders:create}
driver	سائق	يستخدم تطبيق السائق لتحديث حالات الطلبات.	10	{driver-app:use}
merchant	تاجر	يستخدم بوابة التجار لمتابعة الطلبات.	96	{merchant-portal:use}
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version, applied_at, checksum) FROM stdin;
001_initial_schema.sql	2025-12-11 15:50:20.135457	-2d3b0699
002_seed_data.sql	2025-12-11 15:50:20.143767	5fe0cef4
003_create_admin_user.sql	2025-12-11 15:50:20.147705	-3f1114a7
004_create_settings_table.sql	2025-12-11 15:50:20.149998	58826c53
005_add_orders_indexes.sql	2025-12-11 15:50:20.153977	1d831ed
009_create_templates_table.sql	2025-12-29 13:44:13.179422	3bafef65
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, company_id, settings_data, created_at, updated_at, created_by, updated_by) FROM stdin;
1	1	{"ui": {"density": "comfortable", "iconLibrary": "lucide", "borderRadius": "0.5", "iconStrokeWidth": 2}, "login": {"favicon": null, "loginBg": null, "loginLogo": null, "headerLogo": null, "policyLogo": null, "companyName": "الوميض", "reportsLogo": null, "socialLinks": {"facebook": "", "whatsapp": "", "instagram": ""}, "welcomeMessage": "مرحباً", "showForgotPassword": true}, "orders": {"refPrefix": "REF-", "orderPrefix": "ORD-", "defaultStatus": "PENDING", "archiveAfterDays": 90, "archiveStartStatus": "COMPLETED", "archiveWarningDays": 7}, "policy": {"margins": {"top": 5, "left": 5, "right": 5, "bottom": 5}, "elements": [], "paperSize": "custom", "customDimensions": {"width": 100, "height": 150}}, "aiAgent": {"enabled": true}, "regional": {"currency": "JOD", "language": "ar", "timezone": "Asia/Amman", "dateFormat": "DD/MM/YYYY", "unitsSystem": "metric", "currencySymbol": "د.أ", "firstDayOfWeek": "saturday", "decimalSeparator": ".", "thousandsSeparator": ",", "currencySymbolPosition": "after"}, "notifications": {"aiSettings": {"rules": [], "useAI": false, "aiTone": "friendly"}, "manualTemplates": [{"id": "tpl_1", "sms": "طلبك {{orderId}} خرج للتوصيل. الوميض.", "statusId": "OUT_FOR_DELIVERY", "whatsApp": "مرحباً {{customerName}}، طلبك رقم *{{orderId}}* في طريقه إليك الآن مع السائق {{driverName}}. نتمنى لك يوماً سعيداً!", "recipients": ["customer"]}, {"id": "tpl_2", "sms": "تم توصيل طلبك {{orderId}}. الوميض.", "statusId": "DELIVERED", "whatsApp": "مرحباً {{customerName}}، تم توصيل طلبك رقم *{{orderId}}* بنجاح. شكراً لثقتكم بخدماتنا!", "recipients": ["customer", "merchant"]}, {"id": "tpl_3", "sms": "تم تأجيل طلبك {{orderId}}.", "statusId": "POSTPONED", "whatsApp": "مرحباً {{customerName}}، تم تأجيل توصيل طلبك رقم *{{orderId}}* حسب طلبكم. سيتم التواصل معكم قريباً لتحديد موعد جديد.", "recipients": ["customer"]}, {"id": "tpl_4", "sms": "مرتجع جديد للطلب {{orderId}}.", "statusId": "RETURNED", "whatsApp": "تنبيه: تم إنشاء طلب مرتجع للشحنة رقم *{{orderId}}*. سبب الإرجاع: {{reason}}.", "recipients": ["merchant"]}, {"id": "tpl_5", "sms": "تم إلغاء الطلب {{orderId}}.", "statusId": "CANCELLED", "whatsApp": "نأسف لإبلاغكم بأنه تم إلغاء الطلب رقم *{{orderId}}* من قبل العميل.", "recipients": ["merchant"]}]}, "menuVisibility": {"driver": ["driver-app:use"], "merchant": ["dashboard:view", "orders:view", "financials:view", "merchant-portal:use"]}}	2025-12-11 15:50:20.138098+03	2026-06-08 12:31:33.530325+03	system	admin@alwameed.com
\.


--
-- Data for Name: statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statuses (id, code, name, icon, color, is_active, reason_codes, set_by_roles, visible_to, permissions, flow, triggers) FROM stdin;
STS_009	EXCHANGE	تبديل	Repeat	#fb923c	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_010	REFUSED_PAID	رفض ودفع أجور	ThumbsDown	#ef4444	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_011	REFUSED_UNPAID	رفض ولم يدفع أجور	Ban	#b91c1c	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_014	ARCHIVED	مؤرشف	Archive	#4b5563	f	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_015	NO_ANSWER	لا رد	PhoneOff	#f59e0b	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_016	ARRIVAL_NO_ANSWER	وصول وعدم رد	UserX	#e11d48	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_017	MERCHANT_PAID	تم محاسبة التاجر	Banknote	#0891b2	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_018	WAITING_DRIVER_APPROVAL	بانتظار السائق	UserCheck	#78909C	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_005	RETURNED	مرتجع	Undo2	#8E24AA	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_006	CANCELLED	ملغي	XCircle	#D32F2F	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_007	MONEY_RECEIVED	تم استلام المال في الفرع	HandCoins	#004D40	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_008	COMPLETED	مكتمل	CheckCheck	#1B5E20	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_012	BRANCH_RETURNED	مرجع للفرع	Building	#7e22ce	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_013	MERCHANT_RETURNED	مرجع للتاجر	Undo2	#581c87	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_001	PENDING	بالانتظار	Clock	#607D8B	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_002	OUT_FOR_DELIVERY	جاري التوصيل	Truck	#1976D2	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_003	DELIVERED	تم التوصيل	PackageCheck	#2E7D32	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
STS_004	POSTPONED	مؤجل	CalendarClock	#F9A825	t	{}	{}	{"admin": true, "driver": true, "merchant": true}	{}	{}	{}
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.templates (id, user_id, name, settings, html, created_at, updated_at) FROM stdin;
9urSba6j0UpZER-nHDxOZ	\N	جدول	{"size": "a4-portrait", "fields": {"showCOD": true, "showCity": true, "showDate": true, "showLogo": true, "showNotes": false, "showPhone": true, "showStats": true, "showTable": true, "showAddress": true, "showBarcode": true, "showSummary": true, "showMerchant": true, "showRecipient": true}, "autoFit": true, "logoUrl": "", "margins": 5, "padding": 10, "fontSize": 12, "logoSize": 50, "fieldOrder": ["recipient", "phone", "city", "address", "date", "cod_notes"], "fontFamily": "Cairo", "reportType": "cash_from_driver", "borderWidth": 2, "colorScheme": "color", "itemSpacing": 6, "borderRadius": 4, "documentType": "table", "primaryColor": "1e3a5f", "secondaryColor": "2c5282", "backgroundColor": "ffffff", "maxItemsPerPage": 10}	<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <style>\n    @page { size: 210mm 297mm; margin: 0; }\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: 'Cairo', sans-serif; font-size: 12px; background: #ffffff; padding: 5mm; display: flex; flex-direction: column; }\n    .table-header { text-align: center; margin-bottom: 6px; padding: 10px; background: #1e3a5f; color: white; border-radius: 4px; }\n    .main-table { flex: 1; border: 2px solid #1e3a5f; border-radius: 4px; background: white; }\n    .data-table { width: 100%; border-collapse: collapse; }\n    .data-table th { background: #1e3a5f; color: white; padding: 10px; }\n    .data-table td { padding: 10px; border-bottom: 1px solid #eee; text-align: center; }\n  </style>\n</head>\n<body>\n  <div class="table-header"><h2>📋 جدول المنتجات</h2></div>\n  <div class="main-table">\n    <table class="data-table">\n      <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>\n      <tbody>\n        \n          <tr><td>1</td><td>هاتف ذكي سامسونج</td><td>2</td><td>2500</td><td>5000</td></tr>\n        \n          <tr><td>2</td><td>سماعات بلوتوث</td><td>5</td><td>800</td><td>4000</td></tr>\n        \n          <tr><td>3</td><td>كابل شحن سريع</td><td>10</td><td>150</td><td>1500</td></tr>\n        \n          <tr><td>4</td><td>حامل هاتف للسيارة</td><td>3</td><td>600</td><td>1800</td></tr>\n        \n      </tbody>\n    </table>\n  </div>\n</body>\n</html>	2026-01-01 19:49:06.752473	2026-01-01 19:49:06.752473
lp-DH_AcIO3dzdDSFddq0	\N	عامودي	{"size": "a4-portrait", "fields": {"showCOD": true, "showCity": true, "showDate": true, "showLogo": true, "showNotes": false, "showPhone": true, "showStats": true, "showTable": true, "showAddress": true, "showBarcode": true, "showSummary": true, "showMerchant": true, "showRecipient": true}, "autoFit": true, "logoUrl": "", "margins": 5, "padding": 10, "fontSize": 12, "logoSize": 50, "fieldOrder": ["recipient", "phone", "city", "address", "date", "cod_notes"], "fontFamily": "Cairo", "reportType": "cash_from_driver", "borderWidth": 2, "colorScheme": "color", "itemSpacing": 6, "borderRadius": 4, "documentType": "report", "primaryColor": "1e3a5f", "secondaryColor": "2c5282", "backgroundColor": "ffffff", "maxItemsPerPage": 10}	<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">\n  <style>\n    @page { size: A4 portrait; margin: 10mm; }\n    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n    body { font-family: 'Cairo', sans-serif; font-size: 12px; color: #333; background: white; padding: 5mm; }\n    .report-container { display: flex; flex-direction: column; min-height: 100%; }\n    .report-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 3px solid #1e3a5f; margin-bottom: 20px; }\n    .report-info h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 5px; }\n    .report-meta { font-size: 13px; color: #777; }\n    .company-logo { height: 60px; width: 140px; background: url('data:image/jpeg;base64,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') no-repeat center left/contain; }\n    .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }\n    .stat-box { padding: 12px; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; text-align: center; }\n    .stat-val { display: block; font-size: 20px; font-weight: bold; color: #1e3a5f; font-family: monospace; }\n    .stat-lab { font-size: 11px; color: #777; margin-top: 2px; }\n    .table-wrapper { flex: 1; margin-bottom: 25px; }\n    .data-table { width: 100%; border-collapse: collapse; border: 1px solid #eee; table-layout: fixed; }\n    .data-table th { background: #1e3a5f; color: white; padding: 10px 8px; text-align: right; border: 1px solid #eee; }\n    .data-table td { padding: 8px; border: 1px solid #eee; font-size: 12px; color: #444; word-wrap: break-word; }\n    .sig-area { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; padding-top: 25px; margin-top: auto; }\n    .sig-box { text-align: center; font-size: 13px; }\n    .sig-line { margin-top: 25px; border-top: 1px dashed #ccc; width: 100%; }\n    .report-footer { margin-top: 15px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }\n  </style>\n</head>\n<body>\n  <div class="report-container">\n    <header class="report-header">\n      <div class="report-info">\n        <h1>تقرير استلام أموال من السائق</h1>\n        <div class="report-meta"><span>التاريخ: ١‏/١‏/٢٠٢٦</span> | <span>الشركة: الوميض</span></div>\n      </div>\n      <div class="company-logo"></div>\n    </header>\n    <div class="summary-stats">\n      <div class="stat-box"><span class="stat-val">1,175 د.أ</span><span class="stat-lab">المبلغ الإجمالي</span></div>\n      <div class="stat-box"><span class="stat-val">5</span><span class="stat-lab">القيود</span></div>\n      <div class="stat-box"><span class="stat-val">2</span><span class="stat-lab">مكتملة</span></div>\n      <div class="stat-box"><span class="stat-val">3</span><span class="stat-lab">قيد الانتظار</span></div>\n    </div>\n    <div class="table-wrapper">\n      <table class="data-table">\n        <thead><tr><th style="width: 5%">#</th><th style="width: 15%">الرقم المرجعي</th><th style="width: 25%">المستلم</th><th style="width: 15%">المدينة</th><th style="width: 15%">المبلغ</th><th style="width: 15%">الحالة</th><th style="width: 10%">ملاحظات</th></tr></thead>\n        <tbody>\n          \n            <tr>\n              <td>1</td>\n              <td style="font-family: monospace;">ORD001</td>\n              <td style="font-weight: 600;">أحمد علي</td>\n              <td>عمّان</td>\n              \n              \n              <td style="font-family: monospace; font-weight: bold;">250</td>\n              <td>تم التسليم</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>2</td>\n              <td style="font-family: monospace;">ORD002</td>\n              <td style="font-weight: 600;">محمد حسن</td>\n              <td>الزرقاء</td>\n              \n              \n              <td style="font-family: monospace; font-weight: bold;">180</td>\n              <td>قيد التوصيل</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>3</td>\n              <td style="font-family: monospace;">ORD003</td>\n              <td style="font-weight: 600;">فاطمة يوسف</td>\n              <td>إربد</td>\n              \n              \n              <td style="font-family: monospace; font-weight: bold;">320</td>\n              <td>جديد</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>4</td>\n              <td style="font-family: monospace;">ORD004</td>\n              <td style="font-weight: 600;">سارة خالد</td>\n              <td>عمّان</td>\n              \n              \n              <td style="font-family: monospace; font-weight: bold;">150</td>\n              <td>تم التسليم</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>5</td>\n              <td style="font-family: monospace;">ORD005</td>\n              <td style="font-weight: 600;">علي محمود</td>\n              <td>السلط</td>\n              \n              \n              <td style="font-family: monospace; font-weight: bold;">275</td>\n              <td>قيد التوصيل</td>\n              <td></td>\n            </tr>\n          \n        </tbody>\n      </table>\n    </div>\n    <div class="sig-area">\n      <div class="sig-box"><strong>أمين الصندوق</strong><div class="sig-line"></div></div>\n      <div class="sig-box"><strong>توقيع المستلم</strong><div class="sig-line"></div></div>\n      <div class="sig-box"><strong>الختم الرسمي</strong><div class="sig-line"></div></div>\n    </div>\n    <footer class="report-footer">نظام الوميض لإدارة الشحن والتقارير</footer>\n  </div>\n</body>\n</html>	2026-01-01 19:22:58.788542	2026-01-01 20:11:17.874951
5eq1B_ryFRzSAol8ONlzb	\N	مخصصة أفقي	{"size": "a4-landscape", "fields": {"showCOD": true, "showCity": true, "showDate": true, "showLogo": true, "showNotes": false, "showPhone": true, "showStats": true, "showTable": true, "showAddress": true, "showBarcode": true, "showSummary": true, "showMerchant": true, "showRecipient": true}, "autoFit": true, "logoUrl": "", "margins": 5, "padding": 10, "fontSize": 12, "logoSize": 50, "fieldOrder": ["recipient", "phone", "city", "address", "date", "cod_notes"], "fontFamily": "Cairo", "reportType": "custom_export", "borderWidth": 2, "colorScheme": "color", "itemSpacing": 6, "borderRadius": 4, "documentType": "report", "primaryColor": "1e3a5f", "secondaryColor": "2c5282", "backgroundColor": "ffffff", "maxItemsPerPage": 10}	<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">\n  <style>\n    @page { size: 297mm 210mm; margin: 10mm; }\n    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n    body { font-family: 'Cairo', sans-serif; font-size: 12px; color: #333; background: white; padding: 5mm; }\n    .report-container { display: flex; flex-direction: column; min-height: 100%; }\n    .report-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 3px solid #1e3a5f; margin-bottom: 20px; }\n    .report-info h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 5px; }\n    .report-meta { font-size: 13px; color: #777; }\n    .company-logo { height: 60px; width: 140px; background: url('data:image/jpeg;base64,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') no-repeat center left/contain; }\n    .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }\n    .stat-box { padding: 12px; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; text-align: center; }\n    .stat-val { display: block; font-size: 20px; font-weight: bold; color: #1e3a5f; font-family: monospace; }\n    .stat-lab { font-size: 11px; color: #777; margin-top: 2px; }\n    .table-wrapper { flex: 1; margin-bottom: 25px; }\n    .data-table { width: 100%; border-collapse: collapse; border: 1px solid #eee; table-layout: fixed; }\n    .data-table th { background: #1e3a5f; color: white; padding: 10px 8px; text-align: right; border: 1px solid #eee; }\n    .data-table td { padding: 8px; border: 1px solid #eee; font-size: 12px; color: #444; word-wrap: break-word; }\n    .sig-area { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; padding-top: 25px; margin-top: auto; }\n    .sig-box { text-align: center; font-size: 13px; }\n    .sig-line { margin-top: 25px; border-top: 1px dashed #ccc; width: 100%; }\n    .report-footer { margin-top: 15px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }\n  </style>\n</head>\n<body>\n  <div class="report-container">\n    <header class="report-header">\n      <div class="report-info">\n        <h1>تقرير تصدير بيانات محددة</h1>\n        <div class="report-meta"><span>التاريخ: ١‏/١‏/٢٠٢٦</span> | <span>الشركة: الوميض</span></div>\n      </div>\n      <div class="company-logo"></div>\n    </header>\n    <div class="summary-stats">\n      <div class="stat-box"><span class="stat-val">1,175 د.أ</span><span class="stat-lab">المبلغ الإجمالي</span></div>\n      <div class="stat-box"><span class="stat-val">5</span><span class="stat-lab">القيود</span></div>\n      <div class="stat-box"><span class="stat-val">2</span><span class="stat-lab">مكتملة</span></div>\n      <div class="stat-box"><span class="stat-val">3</span><span class="stat-lab">قيد الانتظار</span></div>\n    </div>\n    <div class="table-wrapper">\n      <table class="data-table">\n        <thead><tr><th style="width: 5%">#</th><th style="width: 15%">الرقم المرجعي</th><th style="width: 25%">المستلم</th><th style="width: 15%">المدينة</th><th style="width: 20%">العنوان</th><th style="width: 12%">الهاتف</th><th style="width: 15%">المبلغ</th><th style="width: 15%">الحالة</th><th style="width: 10%">ملاحظات</th></tr></thead>\n        <tbody>\n          \n            <tr>\n              <td>1</td>\n              <td style="font-family: monospace;">ORD001</td>\n              <td style="font-weight: 600;">أحمد علي</td>\n              <td>عمّان</td>\n              <td>دوار الداخلية</td>\n              <td>0795554433</td>\n              <td style="font-family: monospace; font-weight: bold;">250</td>\n              <td>تم التسليم</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>2</td>\n              <td style="font-family: monospace;">ORD002</td>\n              <td style="font-weight: 600;">محمد حسن</td>\n              <td>الزرقاء</td>\n              <td>شارع مكة</td>\n              <td>0784443322</td>\n              <td style="font-family: monospace; font-weight: bold;">180</td>\n              <td>قيد التوصيل</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>3</td>\n              <td style="font-family: monospace;">ORD003</td>\n              <td style="font-weight: 600;">فاطمة يوسف</td>\n              <td>إربد</td>\n              <td>وسط البلد</td>\n              <td>0773332211</td>\n              <td style="font-family: monospace; font-weight: bold;">320</td>\n              <td>جديد</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>4</td>\n              <td style="font-family: monospace;">ORD004</td>\n              <td style="font-weight: 600;">سارة خالد</td>\n              <td>عمّان</td>\n              <td>الجبيهة</td>\n              <td>0791112233</td>\n              <td style="font-family: monospace; font-weight: bold;">150</td>\n              <td>تم التسليم</td>\n              <td></td>\n            </tr>\n          \n            <tr>\n              <td>5</td>\n              <td style="font-family: monospace;">ORD005</td>\n              <td style="font-weight: 600;">علي محمود</td>\n              <td>السلط</td>\n              <td>الحي الشرقي</td>\n              <td>0780001122</td>\n              <td style="font-family: monospace; font-weight: bold;">275</td>\n              <td>قيد التوصيل</td>\n              <td></td>\n            </tr>\n          \n        </tbody>\n      </table>\n    </div>\n    <div class="sig-area">\n      <div class="sig-box"><strong>أمين الصندوق</strong><div class="sig-line"></div></div>\n      <div class="sig-box"><strong>توقيع المستلم</strong><div class="sig-line"></div></div>\n      <div class="sig-box"><strong>الختم الرسمي</strong><div class="sig-line"></div></div>\n    </div>\n    <footer class="report-footer">نظام الوميض لإدارة الشحن والتقارير</footer>\n  </div>\n</body>\n</html>	2026-01-01 20:12:27.600831	2026-01-01 20:12:27.600831
QOvl7Cstxh4KXwkFXA-bT	\N	100×150 عامودي	{"size": "thermal-100x150-portrait", "fields": {"showCOD": true, "showCity": true, "showDate": true, "showLogo": true, "showNotes": false, "showPhone": true, "showStats": true, "showTable": true, "showAddress": true, "showBarcode": true, "showSummary": true, "showMerchant": true, "showRecipient": true}, "autoFit": true, "logoUrl": "", "margins": 5, "padding": 10, "fontSize": 12, "logoSize": 50, "fieldOrder": ["recipient", "phone", "city", "address", "date", "cod_notes"], "fontFamily": "Cairo", "reportType": "cash_from_driver", "borderWidth": 2, "colorScheme": "color", "itemSpacing": 6, "borderRadius": 4, "documentType": "policy", "primaryColor": "1e3a5f", "secondaryColor": "2c5282", "backgroundColor": "ffffff", "maxItemsPerPage": 10}	<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>\n  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">\n  <style>\n    @page { size: 100mm 150mm; margin: 0; }\n    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n    body { \n      font-family: 'Cairo', sans-serif; \n      background: white; \n      color: #000; \n      width: 100mm; \n      height: 150mm; \n      overflow: hidden; \n      padding: 5mm; \n    }\n    \n    .thermal-container { \n      height: 100%; \n      border: 2px solid #000; \n      padding: 10px; \n      display: flex; \n      flex-direction: column; \n      border-radius: 4px;\n      gap: 6px;\n    }\n\n    .header-boxes { \n      display: grid; \n      grid-template-columns: 1fr 1fr; \n      gap: 6px; \n      margin-bottom: 3px; \n      padding-bottom: 6px;\n      border-bottom: 2px solid #000;\n    }\n\n    .store-box, .barcode-box {\n      background: #f3f4f6;\n      border: 1px solid #e5e7eb;\n      border-radius: 4px;\n      padding: 5px;\n      text-align: center;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n    }\n\n    .merchant-name-label { font-weight: 900; font-size: 14px; color: #111827; margin-bottom: 2px; }\n    .store-phone { font-weight: bold; font-size: 12px; color: #4b5563; }\n    \n    .barcode-target { height: 40px; width: 100%; }\n    .barcode-text { font-family: monospace; font-size: 12px; font-weight: bold; }\n\n    .fields-list { \n      display: flex; \n      flex-direction: column; \n      gap: 6px; \n      flex: 1;\n    }\n\n    .field-box {\n      background: #f9fafb;\n      border: 1px solid #e5e7eb;\n      border-radius: 4px;\n      padding: 6.666666666666667px 10px;\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      font-size: 12px;\n    }\n\n    .f-label { font-weight: 600; color: #4b5563; }\n    .f-value { font-weight: bold; color: #111827; }\n\n    .notes-box {\n      flex-direction: column;\n      align-items: flex-start;\n      gap: 4px;\n      background: #fef9c3;\n      border: 1.5px dashed #ca8a04;\n    }\n    .notes-box .f-value { text-align: right; width: 100%; font-size: 0.9em; }\n\n    .cod-banner-dark {\n      background: #374151;\n      color: #fff;\n      padding: 10px;\n      border-radius: 4px;\n      text-align: center;\n      font-weight: 900;\n      font-size: 18px;\n      margin-top: auto;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n    }\n\n    .thermal-footer {\n      margin-top: 6px;\n      padding-top: 6px;\n    }\n\n    .footer-line { border-top: 1px dashed #ccc; margin-bottom: 8px; }\n    .footer-content {\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 6px;\n      color: #6b7280;\n      font-size: 11px;\n    }\n    .mini-logo { height: 16px; width: auto; }\n    .company-name-footer { color: #111827; font-weight: 900; }\n\n    /* Standard Styles (A4/A5) */\n    .standard { width: 100%; height: 100%; font-size: 12px; }\n    .standard-inner { height: 100%; display: flex; flex-direction: column; }\n    .standard .standard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 20px; }\n    .standard .main-logo { height: 65px; margin-bottom: 5px; }\n    .standard .whatsapp { font-weight: bold; color: #555; font-size: 14px; }\n    .standard .barcode-box-std { text-align: center; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 8px; }\n    .standard .order-number { font-family: monospace; font-weight: 900; font-size: 18px; color: #1e3a5f; letter-spacing: 2px; }\n    .standard .merchant-banner { display: flex; justify-content: space-between; align-items: center; color: white; padding: 15px 30px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n    .standard .b-value { font-size: 1.8em; font-weight: 900; }\n    .standard .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1; }\n    .standard .grid-cell { padding: 10px; border-bottom: 1px solid #f0f0f0; }\n    .standard .grid-cell.span-2 { grid-column: span 2; }\n    .standard .grid-cell h4 { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }\n    .standard .grid-cell p { font-size: 1.3em; font-weight: 800; color: #111; }\n    .standard .notes-section { background: #fff9db; border: 2px dashed #fab005; border-radius: 15px; }\n    .standard .cod-section { margin-top: 30px; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 20px; padding: 30px; text-align: center; }\n    .standard .total-label { font-size: 16px; font-weight: bold; color: #444; margin-bottom: 5px; }\n    .standard .total-value { font-size: 3.5em; font-weight: 900; }\n    .standard .standard-footer { margin-top: 40px; text-align: center; color: #aaa; }\n    .standard .divider { height: 1px; background: #eee; width: 60%; margin: 10px auto; }\n  </style>\n</head>\n<body>\n  \n      <div class="policy-wrapper thermal">\n        <div class="thermal-container">\n          <div class="header-boxes">\n            <div class="store-box">\n              <span class="merchant-name-label">{{merchant}}</span>\n            </div>\n            <div class="barcode-box">\n              <svg class="barcode-target" data-value="{{orderNumber}}"></svg>\n              <div class="barcode-text">{{orderNumber}}</div>\n            </div>\n          </div>\n          \n          <div class="fields-list">\n            <div class="field-box"><span class="f-label">المستلم:</span><span class="f-value">{{recipient}}</span></div><div class="field-box"><span class="f-label">الهاتف:</span><span class="f-value" dir="ltr">{{phone}}</span></div><div class="field-box"><span class="f-label">المدينة:</span><span class="f-value">{{city}}</span></div><div class="field-box"><span class="f-label">العنوان:</span><span class="f-value">{{address}}</span></div><div class="field-box"><span class="f-label">التاريخ:</span><span class="f-value">{{date}}</span></div>\n          </div>\n          \n          \n            <div class="cod-banner-dark">\n              <span>المطلوب: {{cod}}</span>\n              <span class="coin-icon">💰</span>\n            </div>\n          \n\n          <div class="thermal-footer">\n            <div class="footer-line"></div>\n            <div class="footer-content">\n              <span class="produced-by">بواسطة</span>\n              <img src="data:image/jpeg;base64,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" class="mini-logo" />\n              <strong class="company-name-footer">الوميض</strong>\n            </div>\n          </div>\n        </div>\n      </div>\n    \n  <script>\n    window.onload = function() {\n      const barcodes = document.querySelectorAll('.barcode-target[data-value]');\n      barcodes.forEach(function(svg) {\n        const value = svg.getAttribute('data-value');\n        if (value && typeof JsBarcode !== 'undefined') {\n          JsBarcode(svg, value, { format: 'CODE128', width: 2, height: 40, displayValue: false, margin: 0 });\n        }\n      });\n    }\n  </script>\n</body>\n</html>	2025-12-29 14:57:53.242229	2026-01-01 22:05:13.783088
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, store_name, role_id, avatar, whatsapp, price_list_id, created_at, updated_at) FROM stdin;
user-salahwh	salahwh	admin@alwameed.com	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	salahwh	admin		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
user-rami	رامي عوده الله	0790984807	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	رامي عوده الله	supervisor		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
user-moayad	مؤيد	0096721759	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	مؤيد	customer_service		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
user-razan	رزان	0793204777	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	رزان	supervisor		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
user-bahaa	bahaa	0788741261	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	bahaa	supervisor		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-1	ابو العبد	0799754316	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ابو العبد	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-2	محمد سويد	0799780790	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	محمد سويد	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-3	احمد عزاوي	0787085576	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	احمد عزاوي	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-4	محافظات	0778132881	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	محافظات	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-5	Ebox	0797953190	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Ebox	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-6	سامي سويد	0797274740	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	سامي سويد	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-7	مجد كميل	0789358393	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	مجد كميل	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-8	سامر الطباخي	0790690353	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	سامر الطباخي	driver		\N	pl_1-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-9	فارس الأسمر	0795365013	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	فارس الأسمر	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
driver-10	حسن زيغان	0786112230	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	حسن زيغان	driver		\N	\N	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-1	جنان صغيرة	0786633891	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	جنان صغيرة	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-2	Brands of less	0775343162	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Brands of less	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-3	عسل	0776807347	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	عسل	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-4	Roosh Cosmetics	0782099324	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Roosh Cosmetics	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-5	Stress Killer	0781399935	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Stress Killer	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-6	Brandlet Outlet -1	0776979308	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Brandlet Outlet -1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-7	زينة بوتيك	0781223373	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	زينة بوتيك	merchant		\N	pl_2_2_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-8	0795768540	0795768540	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	N&L Botique	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-9	D boutique -1	0799453019	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	D boutique -1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-10	Macrame -1	0799417458	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Macrame -1	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-11	Jacks NYC-1	0799585111	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Jacks NYC-1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-12	بدر	0788069001	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	بدر	merchant		\N	pl_3_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-13	عود الجدايل	0795865900	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	عود الجدايل	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-14	Luxury Baskets - 1	0795350016	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Luxury Baskets - 1	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-15	مالك موبايل - 1	0791808036	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	مالك موبايل - 1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-16	Oceansfounds -1	0798453904	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Oceansfounds -1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-17	Rubber Ducky	0790965593	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Rubber Ducky	merchant		\N	pl_2_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-18	Travelers Cart	0790989646	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Travelers Cart	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-19	outofpiece -1	0796365702	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	outofpiece -1	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-20	د. قصي المحاسنة	0778877889	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	شركة الزنبقة الذهبية لمستحضرات التجميل	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-21	KADI MODA -1	0795001395	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	KADI MODA -1	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-22	عمرو النبتيتي	0790181203	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	عود ومسك	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-23	عمرو النبتيتي	0790181202	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	oud gold	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-24	Glowy Thingz	0776529541	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Glowy Thingz	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-25	منى قباني	0798908709	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Vintage	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-26	ليالي كعوش	0796779264	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ليالي	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-27	السامي السامي	0795595544	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	السامي جديد	merchant		\N	pl_alsami	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-28	Watermelon Watermelon	0795032558	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Watermelon	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-29	Visionary Closet	0799996991	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Visionary Closet	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-30	حلا مراد	0507963858	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	The beauty Spot	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-31	ابرة وخيط	0791751140	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ابرة وخيط	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-32	مشغل سيف	0796157766	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	مشغل سيف	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-33	Mohammad Zamil	0790719429	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Vintromatica	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-34	صلاتي صلاتي	0799059050	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	صلاتي	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-35	yari yari	0792856814	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Yari Jewelry	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-36	درر الكويت	0795865907	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	اطباب درر الكويت	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-37	بيوتيك بيوتيك	0797300177	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	بيوتيك	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-38	يوني آرت	0798975131	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Uniart	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-39	sneaker fever	0795593048	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	sneaker fever	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-40	جود سعد الدين	0790797946	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Salat	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-41	بنان شهوان	0799013502	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	UNICICTY	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-42	قيس موبايل	0790790506	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	قيس موبايل	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-43	حديقتي حديقتي	0790349948	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	حديقتي	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-44	Lucky pads	0792002676	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Lucky pads	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-45	Shein Mediator	0796447494	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Shein Mediator	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-46	OOTD OOTD	0775165727	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	OOTD	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-47	هدومكم هدومكم	0775527463	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	هدومكم	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-48	باي زي	0790682649	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	متجر	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-49	sunglasses jo	0789499940	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Sunglasses	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-50	احمد الزهيري	0788784211	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	aleph	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-51	عطارة زلوم	0797422180	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	زلوم	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-52	ارقية للبخور	0799063180	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ارقية للبخور	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-53	احمد الفريح	0796148776	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Jules thrift	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-54	تولين دشداشة	0791880567	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	دشداشة	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-55	Yasmeen Shop	0798891541	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Yasmeen's Shop	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-56	Beauty Home بيوتي هوم	0790989675	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	بيوتي هوم	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-57	الاعتماد الاعتماد	0004895785	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	الاعتماد	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-58	هودي هودي	0791558273	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	هودي	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-59	Waves sport	0790212227	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Waves sport	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-60	بوكيه بوكيه	0796679457	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	بوكيه	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-61	we brand	0780858758	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	we brand	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-62	بنان خضر	0796630606	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	يافا ستور	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-63	شي ان سارة	0788360254	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	شي ان سارة	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-64	اسيل بوتيك	0795744905	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	اسيل بوتيك	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-65	k by women	0788870887	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	K BY WOMEN	merchant		\N	pl_2_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-66	كتب كتب	0786305521	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	كتب	merchant		\N	pl_abu_saif	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-67	فراس بندك	0795639962	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Barchastation	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-68	Memories Store	0791150329	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Memories Store	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-69	ظاهر ظاهر	0798086344	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	متجر stakarz	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-70	cozy on cozy	0777242400	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	cozy on	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-71	MELLOW	0799973533	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	MELLOW	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-72	I MODELS	0775522889	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	I MODELS	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-73	محمد ابو سمرة	0795565272	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	SAMRA	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-74	هدى الطردة	0799168727	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	هدى الطردة	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-75	Roze art	0790350138	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Roze art	merchant		\N	pl_2_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-76	dot dot	0791553834	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	dot	merchant		\N	pl_2_2_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-77	bags art	0775697986	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	bags art	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-78	مجد كميل صفحة	0789358390	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Bambeno	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-79	ريتان ريتان	0796216115	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ريتان	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-80	فوغيش فوغيش	0790997378	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	فوغيش	merchant		\N	pl_2_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-81	طارق زيا	0788958226	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	mubarak gift	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-82	Razan Taha	0798156099	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Ro Designs	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-83	Only Shirts	0798482623	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Only Shirts	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-84	Tactical tent	0799887458	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Tactical tent-1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-85	خالد ش	0795595545	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	السامي للمستلزمات الطبية	merchant		\N	pl_alsami	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-86	جواد العبادي	0785000035	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	ماجد	merchant		\N	pl_majd	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-87	معا لنمسك بيدهم	0798150153	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	معا لنمسك بيدهم	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-88	غازي المر	0797907918	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	basmetics	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-89	لافي لافي	0789749486	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	لافي	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-90	زيد خليفة	0781039259	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Vamos -1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-91	Elegance Home	0792928010	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Elegance Home -1	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-92	Sweet candle	0799685239	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	Sweet candle - 1	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-93	artfully pieces	0799965664	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	artfully pieces	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-94	مجدولين مجدولين	0796446987	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	مجدولين	merchant		\N	pl_2-5_3	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-95	OOF lingerie	0797538609	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	OOF lingerie	merchant		\N	pl_1	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
merchant-96	دانا الحوامدة	0777055604	$2a$10$rb9l6OSVLZxPzRqD/g2NVuacQmXtyz8APNxkWH0Cj3PKfdOOy.Kmi	دانا حوامدة	merchant		\N	pl_2_5_3_5	2025-12-11 16:25:18.341814	2025-12-11 16:25:18.341814
\.


--
-- Name: order_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_audit_logs_id_seq', 5, true);


--
-- Name: order_settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_settlements_id_seq', 1, false);


--
-- Name: order_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_tracking_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 204182, true);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: driver_payment_slips driver_payment_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payment_slips
    ADD CONSTRAINT driver_payment_slips_pkey PRIMARY KEY (id);


--
-- Name: driver_return_slips driver_return_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_return_slips
    ADD CONSTRAINT driver_return_slips_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: merchant_payment_slips merchant_payment_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchant_payment_slips
    ADD CONSTRAINT merchant_payment_slips_pkey PRIMARY KEY (id);


--
-- Name: merchant_return_slips merchant_return_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchant_return_slips
    ADD CONSTRAINT merchant_return_slips_pkey PRIMARY KEY (id);


--
-- Name: order_audit_logs order_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_audit_logs
    ADD CONSTRAINT order_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: order_settlements order_settlements_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_settlements
    ADD CONSTRAINT order_settlements_order_id_key UNIQUE (order_id);


--
-- Name: order_settlements order_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_settlements
    ADD CONSTRAINT order_settlements_pkey PRIMARY KEY (id);


--
-- Name: order_tracking order_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_tracking
    ADD CONSTRAINT order_tracking_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: settings settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_company_id_key UNIQUE (company_id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: statuses statuses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_code_key UNIQUE (code);


--
-- Name: statuses statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_areas_city_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_areas_city_id ON public.areas USING btree (city_id);


--
-- Name: idx_areas_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_areas_name ON public.areas USING btree (name);


--
-- Name: idx_order_settlements_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_settlements_order_id ON public.order_settlements USING btree (order_id);


--
-- Name: idx_order_settlements_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_settlements_status ON public.order_settlements USING btree (status);


--
-- Name: idx_order_tracking_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_tracking_order_id ON public.order_tracking USING btree (order_id);


--
-- Name: idx_order_tracking_recorded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_tracking_recorded_at ON public.order_tracking USING btree (recorded_at DESC);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_date ON public.orders USING btree (date DESC);


--
-- Name: idx_orders_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_driver ON public.orders USING btree (driver);


--
-- Name: idx_orders_merchant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_merchant ON public.orders USING btree (merchant);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_phone ON public.orders USING btree (phone);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_status_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_date ON public.orders USING btree (status, date DESC);


--
-- Name: idx_regions_city_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_city_id ON public.regions USING btree (city_id);


--
-- Name: idx_settings_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_company_id ON public.settings USING btree (company_id);


--
-- Name: idx_settings_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_data ON public.settings USING gin (settings_data);


--
-- Name: idx_templates_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_created_at ON public.templates USING btree (created_at DESC);


--
-- Name: idx_templates_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_name ON public.templates USING btree (name);


--
-- Name: idx_templates_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_user_id ON public.templates USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: orders orders_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER orders_updated_at_trigger BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: settings settings_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER settings_updated_at_trigger BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_settings_updated_at();


--
-- Name: templates templates_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER templates_updated_at_trigger BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users users_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_updated_at_trigger BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drivers drivers_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: order_settlements order_settlements_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_settlements
    ADD CONSTRAINT order_settlements_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_tracking order_tracking_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_tracking
    ADD CONSTRAINT order_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: regions regions_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- Name: templates templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Uz0p0LD9auIOaNlWnH84Q4iSRMeH6maUmP3mCFyGT0kpgDDNCAvuQ8Hh8H6ECkD

